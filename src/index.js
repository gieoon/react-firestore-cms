// Client-facing CMS
// Client navigates to their webpage, then to /edit, then they can update the content as they wish.

import React, {useState, useEffect, useCallback} from 'react';
import {Helmet} from "react-helmet";
// import firebase from 'firebase/app';
import firebase from "firebase";
// import 'firebase/firestore';
// import 'firebase/auth';
// import 'firebase/storage';

// import 'firebase/auth';
// import 'firebase/storage';
import { Check, Square, Plus, X, Edit, Trash2, Image, Headphones, File, Paperclip } from 'react-feather';
import profile from './assets/profile.png';
// import blank_image from '../assets/blank_image.png';
// import blank_audio from '../assets/blank_audio.png';
import Loading from './loading.js';
import TextEditor from './textEditor.js';
import RichTextEditor from 'react-rte';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import {firebaseDate2DisplayDate} from './commonFunctions';
import {
    STORAGE_ROOT
} from './constants';
import WebpageEditor from './webpageEditor.js';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import { Document, Page } from 'react-pdf';
// import { pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import UpdatePage from './UpdatePage.js';

import firebaseConfig from './config';
/* 
    Your Firebase config file via 
    1. Firebase console
    2. Click on Project Settings to get this
    3. Save to an external folder and import here.
*/
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default function CMS({
    projectName,
    children,
}){
    const [loginComplete, setLoginComplete] = useState(false);
    const [currentUid, setCurrentUid] = useState();
    const [currentUser, setCurrentUser] = useState({});
    const [currentEmail, setCurrentEmail] = useState("");
    const [currentSection, setCurrentSection] = useState("");
    const [pageData, setPageData] = useState({sections:[]});
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
    const [showingNew, setShowingNew] = useState(false);
    const [newText, setNewText] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newDate, setNewDate] = useState(new Date()); //useState(undefined);
    const [showSaving, setShowSaving] = useState(false);
    const [showingEdit, setShowingEdit] = useState(undefined);
    const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
    const [frameLoaded, setFrameLoaded] = useState(false);
    const [webpageEditable, setWebpageEditable] = useState(false);

    const [newImages, setNewImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newAudio, setNewAudio] = useState([]);

    const [rteInitTitle, setRteInitTitle] = useState();
    const [rteInitContent, setRteInitContent] = useState();

    const [showingAdditionalDate, setShowingAdditionalDate] = useState(false);
    const [additionalDate, setAdditionalDate] = useState(new Date());

    const [editType, setEditType] = useState(0);

    const [storage, setStorage] = useState();

    useEffect(()=>{
        if(!currentUid){           
            setStorage(firebase.storage().ref());

            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    // var displayName = user.displayName;
                    // var email = user.email;
                    // var emailVerified = user.emailVerified;
                    // var photoURL = user.photoURL;
                    // var isAnonymous = user.isAnonymous;
                    // var uid = user.uid;
                    // var providerData = user.providerData;
                    // console.log('Login complete: ', user.uid);
                    setCurrentEmail(user.email);
                    setCurrentUser(user);
                    // console.log(user);
                    // console.log(user);
                    setLoginComplete(true);
                    setCurrentUid(user.uid);
                } else {
                    // console.log('Not signed in');
                    setLoginComplete(true);
                    setCurrentUid("");
                    setCurrentUser("");
                    setCurrentEmail("");
                }   
            })

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            // .then(()=>{
            //     firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            //         var errorCode = error.code;
            //         var errorMessage = error.message;
            //     });
            // })
        }
    }, []);

    // useEffect(()=>{
    //     setNewTitle("");
    //     setNewText("");
    // }, showingNew);

    const LogIn = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            // var token = result.credential.accessToken;
            // var user = result.user;
            // setCurrentUid(user.uid);
            // setCurrentUser(user);
            // setCurrentEmail(user.email);
            // setLoginComplete(true);
          }).catch(function(err) {
            // Handle Errors here.
            // var errorCode = error.code;
            // var errorMessage = error.message;
            // // The email of the user's account used.
            // var email = error.email;
            // // The firebase.auth.AuthCredential type that was used.
            // var credential = error.credential;
            console.error("Error signing in: ", err);
          });
    }

    useEffect(()=>{
        // DB calls to load data to edit
        // console.log('Initializing CMS data');
        if(currentUid){
            authTest();
            init();
        }
    }, [loginComplete, currentUid])

    // Try and set some dummy data to check if it's possible
    const authTest = () => {
        if(!db) return;
        db.collection('CMS') 
            .doc(projectName)
            .set({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, {merge: true})
            .then((e) => {
                console.log(e);
            }).catch(err => {
                console.error("Error in authTest: ", err);
                firebase.auth().signOut();
            });
        
    }

    const init = () => {
        // console.log("currentUid: ", currentUid);
        loadWebpageDataFromUid().then(pageData => {
            // console.log('init pageData!!!!: ', pageData);
            if(!pageData && loginComplete){
                firebase.auth().signOut();
                return;
            }
            setPageData(pageData || {sections:[]})
            setWebpageEditable(pageData.webpageEditable);
            if(pageData.webpageEditable)
                setEditType(0);
            loadAllSectionData(pageData || {sections:[]}).then(d => {
                // console.log(d)
                // setPageData({
                //     ...pageData, 
                //     ...d
                // })
            })
            // Default to first section
            if(pageData && pageData.sections.length) 
                setCurrentSection(pageData.sections[0] || "");
        });
    }

    const loadWebpageDataFromUid = async () => {
        // console.log('projectName: ', currentUid, projectName);
        if(!db || !currentUid || !loginComplete) return {sections:[]};
        return db.collection('CMS')
            .doc(projectName)
            .get()
            .then(doc => {

                // console.log(doc.data());
                // const serverUid = doc.get('uid');
                const serverEmail = doc.get('email');
                // if(    currentEmail === serverEmail  
                //     || currentEmail === 'jun.a.kagaya@gmail.com' 
                //     || currentEmail === 'powerofrepetition@gmail.com'){
                // if(serverUid === currentUid){
                    // console.log("user confirmed: ", serverEmail);
                    // return db.collection('CMS')
                    //     .doc(projectName)
                    //     .get()
                    //     .then(doc => {
                    //         // console.log(doc.data())
                    //         return doc.data() || [];
                    //     })
                    return doc.data() || {sections:[]};
                // }
                // else {
                //     console.error("user mismatch: ", serverEmail, " <=> ",currentEmail);
                //     return {sections:[]};
                // }
            })
            .catch(err => {
                console.error("Error reading user data: ", err);
                return undefined;
            })
    }

    // useEffect(()=>{
        // loadAllSectionData();
        // console.dir(pageData)
    // }, [pageData]);

    const forceUpdate = useCallback(()=>{
        updatePageData({});
    }, []);

    const [, updatePageData] = useState();

    const loadAllSectionData = async (data) => {
        // console.log(data)
        if(!data.sections) return;
        const promises = [];
        const out = {};
        data.sections.forEach((section) => {
            promises.push(
                loadSectionData(section, data).then(d => {
                    out[section] = d;
                })
            );
            // setPageData({
            //     ...data, 
            //     [section]: d
            // })
        })
        
        return Promise.all(promises).then(()=>{
            // console.log(out)
            return out;
        });
    }

    const loadSectionData = async (sectionName, data) => {
        // console.log('Loading data for: ', sectionName);
        return db.collection('CMS')
            .doc(projectName)
            .collection(sectionName)
            // .orderBy('createdOn', 'desc')
            .orderBy('date', 'desc')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const p = data;
                    if(!p[sectionName]) p[sectionName] = {};
                    if(change.type === 'added' || change.type === 'modified'){
                        // Backcompatibility converting old imageURL/audioURL into array of objects
                        const out = change.doc.data();
                        if(out.imageURL){
                            out.images = [
                                {
                                    id: Date.now().toString(),
                                    url: out.imageURL,
                                    path: "",
                                    name: "",
                                }
                            ]
                        }
                        if(out.audioURL){
                            out.audio = [
                                {
                                    id: Date.now().toString(),
                                    url: out.audioURL,
                                    name: "",
                                    path: "",
                                }
                            ]
                        }
                        p[sectionName][change.doc.id] = {...out, id: change.doc.id};
                        
                        // console.log('added new: ', p.sections, p);
                    }
                    else if(change.type === 'removed'){
                        delete p[sectionName][change.doc.id];
                    }
                    
                    setPageData(p);
                    forceUpdate();
                })
            })
    }

    const saveImage = async (fileObj) => {
        if(!fileObj.localFile) {
            return {
                url: fileObj.url, 
                path: fileObj.path
            }
        }
        const metaData = {
            customMetadata: {
                "uploader": currentEmail
            }
        }
        const path = getStoragePath('images', fileObj.name);
        var storageRef = storage.child(path);
        return storageRef.put(fileObj.localFile, metaData).then(snapshot => {
            console.log("Uploaded Image");
            return snapshot.ref.getDownloadURL().then(url => {
                return {url, path};
            })
        })
    }

    const saveAudio = async (fileObj) => {
        if(!fileObj.localFile) {
            return {
                url: fileObj.url, 
                path: fileObj.path
            }
        }
        const metaData = {
            customMetadata: {
                "uploader": currentEmail
            }
        }
        const path = getStoragePath('audio', fileObj.name);
        var storageRef = storage.child(path);
        return storageRef.put(fileObj.localFile, metaData).then((snapshot) => {
            console.log('Uploaded Audio');
            return snapshot.ref.getDownloadURL().then(url => {
                return {url, path};
            })
        })
        .catch(err => {
            console.error("Error saving audio: ", err);
        })
    }

    const saveMiscellaneous = async (fileObj) => {
        // If local file exists, it means it has been freshly uploaded and needs to be saved, 
        // Otherwise it has already been saved and can be ignored
        if(!fileObj.localFile) {
            return {
                url: fileObj.url, 
                path: fileObj.path
            };
        }

        const metaData = {
            customMetadata: {
                "uploader": currentEmail
            }
        }

        const path = getStoragePath('miscellaneous', fileObj.name);
        console.log('saving fileObj: ', fileObj);
        var storageRef = storage.child(path);
        return storageRef.put(fileObj.localFile, metaData).then((snapshot) => {
            console.log('Uploaded miscellaneous');
            return snapshot.ref.getDownloadURL().then(url => {
                return {url, path};
            })
        })
        .catch(err => {
            console.error("Error saving miscellaneous: ", err);
        })
    }

    const getStoragePath = (type, filename) => {
        // return currentEmail + "/" + type + "/" + Date.now() + "-" + filename;
        // Remove the date from here, looks ugly.
        //return currentEmail + "/" + type + "/" + filename;
        return projectName + "/" + type + "/" + filename;
    }

    // Saves new article, or news item, etc.
    const saveNew = async () => {
        // Hack to trigger state change and rfresh TextEditor
        setShowSaving(true);
        setRteInitTitle("_");
        setRteInitContent("_");
        let sectionName = pageData.sections[selectedSectionIndex];
        
        // Only save to storage if not already saved, determined by checking to see if it is local link.
        var imgObjs = [];
        for(var i=0;i<newImages.length;i++){
            var imgObj = (newImages[i].downloadUrl || "").includes(STORAGE_ROOT)
                ? newImages[i] : await saveImage(newImages[i]);
            imgObjs.push({
                ...imgObj,
                id: newImages[i].id,
                name: newImages[i].name
            });
        }

        var audioObjs = [];
        for(var i=0;i<newAudio.length;i++){
            var audioObj = (newAudio[i].downloadUrl || "").includes(STORAGE_ROOT)
                ? newAudio[i] : await saveAudio(newAudio[i]);
                audioObjs.push({
                    ...audioObj,
                    id: newAudio[i].id,
                    name: newAudio[i].name
                });
        }

        
        // var imageObj = (newImage.url || "").includes(STORAGE_ROOT) 
        //     ? newImage : await saveImage();
        // var audioObj = (newAudio || "").includes(STORAGE_ROOT) 
        //     ? newAudio : await saveAudio();

        var fileObjs = [];
        for(var i=0;i<newFiles.length;i++){
            var fileObj = (newFiles[i].downloadUrl || "").includes(STORAGE_ROOT)
                ? newFiles[i] : await saveMiscellaneous(newFiles[i]);
            fileObjs.push({
                ...fileObj,
                // downloadUrl: newFiles[i].downloadUrl,
                id: newFiles[i].id,
                name: newFiles[i].name,
            });
        }
        // console.log("imageObj: ", imageObj);
        const d = {};

        // if(imageObj) {
        //     d["imageObj"] = imageObj.url || "";
        //     d['imageObj'] = imageObj.path || "";
        // }
        // if(audioObj) {
        //     d["audioURL"] = audioObj.url || "";
        //     d["audioPath"] = audioObj.path || "";
        // }
        d['images'] = imgObjs || [];
        d['audio'] = audioObjs || [];
        d['files'] = fileObjs || [];

        if(newTitle) d["title"] = newTitle;
        if(newText) d['content'] = newText;
        if(newDate) {
            d['date'] = newDate;
        } else {
            d['date'] = new Date().toLocaleDateString('en-CA').toString();
        }
        if(showingAdditionalDate && additionalDate){
            d['additionalDate'] = additionalDate;
        } else {
            d['additionalDate'] = "";
        }
        d['createdOn'] = firebase.firestore.FieldValue.serverTimestamp();

        var id = showingEdit 
            ? showingEdit.id 
            : Date.now().toString();
        
            // console.log('SAVING: ', d);

        db.collection('CMS')
            .doc(projectName)
            .collection(sectionName)
            .doc(id)
            .set(d, {merge: true})
            .then(()=>{
                console.log('Successfully saved entry');
                setShowSaving(false);
                setShowingNew(false);
                setShowingEdit(undefined);
                setRteInitTitle("");
                setRteInitContent("");
                setNewTitle("");
                setNewText("");
                setNewDate(new Date());
                setAdditionalDate(new Date());
                setNewAudio([]);
                setNewImages([]);
                setNewFiles([]);
                setShowingAdditionalDate(false);
                // console.log('reset all fields');
            })
            .catch(err => {
                console.error("Error saving new entry: ", err);
                setShowSaving(false);
                setShowingNew(false);
            })
    }

    // useEffect(()=>{
    //     console.log('new title: ', newTitle);
    // }, [newTitle])

    // useEffect(()=>{
    //     console.log('rteInitTitle: ', rteInitTitle);
    // }, [rteInitTitle])

    const updateSelectedSectionIndex = (i) => {
        setCurrentSection(pageData.sections[i]);
        setSelectedSectionIndex(i);
    }

    const onTextChange = (e) => {
        var text = e;//e.target.value;
        setNewText(text);
    }

    const onTitleChange = (e) => {
        // console.log(e);
        // It's directly HTML now
        setNewTitle(e);
        // setNewTitle(e.target.value);
    }

    const onAudioAdded = (e) => {
        // var audio = e.target.files[0];
        // // setNewAudio(URL.createObjectURL(audio));
        // if(audio && e.target.files.length){
        //     setNewAudio(URL.createObjectURL(audio));
        //     setNewAudioFile(audio);
        // }
        var file = e.target.files[0];
        console.log("audio added: ", file);
        if(file && e.target.files.length){
            setNewAudio(
                [...(newAudio || []),
                {
                    id: Date.now().toString(),
                    url: URL.createObjectURL(file),
                    name: file.name,
                    localFile: file,
                }
                ]
            );
        }
    }

    const onImageAdded = (e) => {
        var file = e.target.files[0];
        console.log("image added: ", file);
        if(file && e.target.files.length){
            setNewImages(
                [...(newImages || []),
                {
                    id: Date.now().toString(),
                    url: URL.createObjectURL(file),
                    name: file.name,
                    localFile: file,
                }
                ]
            );
        }
    }
    // useEffect(()=>{
    //     console.log(newImages);
    // }, [newImages])

    const onFileAdded = (e) => {
        var file = e.target.files[0];
        console.log("file added: ", file);
        if(file && e.target.files.length){
            setNewFiles(
                [...(newFiles || []),
                {
                    id: Date.now().toString(),// For deletion
                    downloadUrl: URL.createObjectURL(file),
                    name: file.name,
                    localFile: file,
                }
                ]
            );
        }
    }

    // useEffect(()=>{
    //     console.log("newFiles: ", newFiles);
    // }, [newFiles]);

    const onDateAdded = (e) => {
        // console.log(e);
        setNewDate(e);
        // setNewDate(e.target.value);
    }

    const onAdditionalDateAdded = (e) => {
        setAdditionalDate(e);
    }

    const hideShowingNew = () => {
        setShowingEdit(undefined);
        setShowingNew(!showingNew);
        setNewAudio([]);
        setNewImages([]);
        setNewDate(new Date());
        setNewFiles([]);
        setAdditionalDate(new Date());
        setNewTitle("");
        setShowingAdditionalDate(false);
        setNewText("");
        setRteInitTitle("");
        setRteInitContent("");
    }

    const removeUploadedImg = (url) => {
        deleteStoredObject('image', url);
        setNewImages(newImages.filter(f => f.url !== url));
    }

    const removeUploadedAudio = (url) => {
        deleteStoredObject('audio', url);
        setNewAudio(newAudio.filter(f => f.url !== url));
    }

    const removeUploadedMiscellaneous = (url) => {
        console.log('removing fileId: ', url);
        console.log("newFiles: ", newFiles);
        deleteStoredObject('miscellaneous', url);
        setNewFiles(newFiles.filter(f => f.url !== url));
    }

    const deleteSectionContent = (entry, projectName, sectionName) => {
        // console.log('deleting all of entry: ', entry)

        if(newImages.length) {
            for(var newFile of newImages){
                // console.log('deleting: ', newFile);
                deleteStoredObject('image', newFile.downloadUrl);
            }
        }

        if(newAudio.length) {
            for(var newFile of newAudio){
                // console.log('deleting: ', newFile);
                deleteStoredObject('audio', newFile.downloadUrl);
            }
        }
        
        if(newFiles.length) {
            for(var newFile of newFiles){
                // console.log('deleting: ', newFile);
                deleteStoredObject('miscellaneous', newFile.downloadUrl);
            }
        }
        if(entry.images && entry.images.length) {
            for(var newFile of entry.images){
                // console.log('deleting: ', newFile);
                deleteStoredObject('image', newFile.url);
            }
        }

        if(entry.audio && entry.audio.length) {
            for(var newFile of entry.audio){
                // console.log('deleting: ', newFile);
                deleteStoredObject('audio', newFile.url);
            }
        }
        
        if(entry.files && entry.files.length) {
            for(var newFile of entry.files){
                // console.log('deleting: ', newFile);
                deleteStoredObject('miscellaneous', newFile.url);
            }
        }

        db.collection('CMS')
            .doc(projectName)    
            .collection(sectionName)
            .doc(entry.id)
            .delete()
            .then(()=>{
                // console.log('Successfully deleted entry');
            })
            .catch(err => {
                console.error("Error deleting entry: ", err);
            });
    }
    
    const deleteStoredObject = (type, downloadUrl) => {
        // Only delete if the url is to an existing file
        // console.log("deleting url 1: ", downloadUrl);
        /*switch(type){
            case 'image': {
                if(!(newImage.url || "").includes(STORAGE_ROOT)){
                    return;
                }
                break;
            }
            case 'audio': {
                if(!(newAudio.url || "").includes(STORAGE_ROOT)){
                    return;
                }
                break;
            }
            case 'miscellaneous': {
                if(!(downloadUrl || "").includes(STORAGE_ROOT)){
                    return;
                }
                break;
            }
            default: {
                console.error('Returning on default');
                return;
            }
        }*/
        if(!(downloadUrl || "").includes(STORAGE_ROOT)){
            return;
        }
    
        firebase.storage().refFromURL(downloadUrl).delete().then(()=>{
            // console.log('Deleted successfully: ', downloadUrl);
        }).catch(err => {
            console.error("Error deleting stored item");
        }) 
    }

    const toggleAdditionalDate = () => {
        setShowingAdditionalDate(!showingAdditionalDate);
    }

    // console.log("additionalDate: ", additionalDate);
    // console.log('loginComplete: ', loginComplete, currentUid, !currentUid && loginComplete);
    return(
        <div className="CMS">
            <Helmet>
                <meta charSet="utf-8" />
                <title>Update your website</title>
                <link rel="icon" type="image/png" href="blank.ico" sizes="16x16" />
            </Helmet>
            <UpdatePage projectName={projectName} db={db} frameLoaded={frameLoaded} />
            {
                !currentUid && loginComplete &&
                <div className="overlay">
                    <div className="content">
                        <h2>Login to update your website</h2>
                        <p>Please use your approved email address</p>
                        {/* <p>Update your website content</p> */}
                        <div className="login" onClick={()=>{LogIn()}}>
                            <span>Login</span>
                        </div>
                    </div>
                </div>
            }
            <div className="inner">
                <div className="left">
                    <div className="title">
                        <h4 className="subtitle">Website Content Management</h4>
                        <h1>{pageData.projectName}</h1>
                    </div>
                    { webpageEditable
                        ? <div className={"editType-wrapper " + (editType === 0 ? "left-selected" : "right-selected")}>
                            <div className={editType === 0 ? "selected" : ""} onClick={()=>setEditType(0)}>Page Content</div>
                            <div className={editType === 1 ? "selected" : ""} onClick={()=>setEditType(1)}>Dynamic Content</div>
                        </div>
                        : ""
                    }
                    { editType === 0
                        ? <div className="sections-wrapper">
                            <div className="section" style={{backgroundColor:"white"}}>Select text on the right to edit it.</div>
                        </div>
                        : <div className="sections-wrapper">
                            { pageData.sections &&
                                pageData.sections.map((section, i) => (
                                    <div key={"left-section-"+i} className={"section " + (selectedSectionIndex === i ? "selected" : "")} onClick={()=>{updateSelectedSectionIndex(i)}}>{section}</div>
                                ))
                            }
                        </div>
                    }
                    <div className="profile">
                        { currentUser.photoURL
                            ? <LazyLoadImage src={currentUser.photoURL} effect="blur" alt="" />
                            : <LazyLoadImage src={profile} effect="blur" alt="" />
                        }
                        <div className="details-wrapper">
                            {
                                currentUser.displayName
                                ? <div className="displayName"><span>{currentUser.displayName}</span></div>
                                : <div onClick={()=>{LogIn()}}></div>
                            }
                            {
                                currentUser.email
                                ? <div className="email"><span>{currentUser.email}</span></div>
                                : <div></div>
                            }
                        </div>
                        { currentUser
                            ? <X onClick={()=>{firebase.auth().signOut();}}/>
                            : ""
                        }
                    </div>
                    <div className="attribution">
                        <span>Website content management - Webbi&copy; 2020</span>
                    </div>
                </div>
                <div className="right">
                    { editType === 0
                        ? <WebpageEditor /*pageData={pageData}*/ setFrameLoaded={setFrameLoaded} children={children} />
                        : <React.Fragment>
                            <div className="top">
                                <div className="header">
                                    { 
                                        pageData.sections && <h1>{pageData.sections[selectedSectionIndex]}</h1>
                                    }
                                </div>
                                <div className="wrapper" onClick={()=>{setShowingNew(!showingNew)}}>
                                    {
                                        showingNew 
                                        ? <X width="48" />
                                        : <Plus width="48" />
                                    }
                                </div>
                            </div>
                            <div className="inner">
                                { pageData.sections && 
                                    (Object.values(pageData[currentSection] || {})).map((entry, index) => (
                                        <SectionContent 
                                            key={"inner-entry-" + index} 
                                            entry={entry} 
                                            setShowingEdit={setShowingEdit}
                                            setShowingNew={setShowingNew}
                                            setNewAudio={setNewAudio}
                                            setNewImages={setNewImages}
                                            setNewFiles={setNewFiles}
                                            setNewDate={setNewDate}
                                            setAdditionalDate={setAdditionalDate}
                                            setNewTitle={setNewTitle}
                                            setNewText={setNewText}
                                            setShowingDeleteDialog={setShowingDeleteDialog}
                                            projectName={projectName}
                                            sectionName={currentSection}
                                            setRteInitTitle={setRteInitTitle}
                                            setRteInitContent={setRteInitContent}
                                            setShowingAdditionalDate={setShowingAdditionalDate}
                                        />
                                    ))
                                }
                            </div>
                        </React.Fragment>
                    }
                </div>
                <div className={"overlay " + (showingNew ? "showing" : "")} onClick={()=>{hideShowingNew()}}></div>
                <div className={"modal " + (showingNew ? "showing" : "")}>
                    <div className="title">
                        <div>
                            <X onClick={()=>{
                                hideShowingNew();
                            }} />
                            {pageData.sections ?
                                showingEdit
                                    ? <h1>Edit {currentSection.toString().toLowerCase()}</h1>
                                    : <h1>Create {currentSection.toString().toLowerCase()}</h1>
                                : ""
                            }
                            {/* {pageData.sections[selectedSectionIndex]} */}
                        </div>
                        <div>
                            <div className="save ok" onClick={()=>{saveNew()}}>
                                <span>Save</span>
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <div className="media-upload-wrapper">
                                <React.Fragment>
                                    <label htmlFor="image-upload">
                                        <div className="image-upload-wrapper">
                                            <Image />
                                            {/* <img src={blank_image} alt="" /> */}
                                        </div>
                                    </label>
                                    <input id="image-upload" type="file" onChange={onImageAdded} hidden={true} accept="image/*" onClick={(e)=>{e.target.value = ""}} />
                                </React.Fragment>
                            {/* } */}
                            
                            {/* <h4>Upload audio file</h4> */}
                            {/* { !newAudio && */}
                                <React.Fragment>
                                    <label htmlFor="audio-upload">
                                        <div className="audio-upload-wrapper">
                                        {/* <img src={blank_audio} alt="" /> */}
                                            <Headphones />
                                        </div>
                                    </label>
                                    <input id="audio-upload" type="file" onChange={onAudioAdded} hidden={true} accept=".mp3,.aif,.aiff,.ogg,.wav,audio/*" onClick={(e)=>{e.target.value = ""}} />
                                </React.Fragment>
                            {/* } */}
                            
                            {/* Generic file */}
                            <label htmlFor="file-upload">
                                <div className="file-upload-wrapper">
                                    <File />
                                </div>
                            </label>
                            {/* https://stackoverflow.com/questions/39484895/how-to-allow-input-type-file-to-select-the-same-file-in-react-component */}
                            <input id="file-upload" type="file" onChange={onFileAdded} hidden={true} accept="application/pdf,application/msword,text/plain,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onClick={(e)=>{e.target.value = ""}} />
                        </div>

                        <div className="uploaded-previews box">
                        { 
                            newImages && newImages.length
                            ? <div>
                                { newImages.map((newImage, i) => (
                                    <div className="uploaded-img-wrapper" key={"img-"+i}>
                                        <LazyLoadImage className="uploaded-img" src={newImage.url} effect="blur" alt="" />
                                        <div onClick={()=>{removeUploadedImg(newImage.url)}}>
                                            <X />
                                        </div>
                                    </div>
                                    ))
                                }
                            </div>
                            : ""
                        }

                        {
                            newAudio && newAudio.length
                            ? <div>
                                { newAudio.map((audio, i) => (
                                    <div className="uploaded-audio-wrapper" key={"audio-"+i}>
                                        <audio 
                                            controls 
                                            className="uploaded-audio"
                                            src={audio.url} type=".mp3,audio/*" 
                                        />
                                        <div onClick={()=>{removeUploadedAudio(audio.url)}}>
                                            <X />
                                        </div>
                                    </div>
                                ))
                                }
                            </div>
                            : ""
                        }

                        {
                            newFiles && newFiles.length 
                            ? <div>
                                { newFiles.map((newFile, i) => (
                                    <div className="uploaded-miscellaneous-wrapper" key={"miscellaneous-"+i}>
                                        <div>
                                            <a href={newFile.downloadUrl || newFile.url} download={newFile.name}>{newFile.name}</a>
                                        </div>
                                        <div onClick={()=>removeUploadedMiscellaneous(newFile.url)}>
                                            <X />
                                        </div>
                                    </div>
                                ))
                                }
                            </div>
                            : ""
                        }
                        </div>

                        {/* https://www.npmjs.com/package/react-date-picker */}
                        <div className="box">
                            <div className="date-wrapper">
                                <h4>Date</h4>
                                <div className="svg-wrapper" onClick={()=>{toggleAdditionalDate()}}>
                                    <label>Using a date range</label>
                                    <div className={"svg-wrapper-inner " + (showingAdditionalDate ? "showing" : "")}>
                                    {
                                        showingAdditionalDate 
                                        // ? <Minus />
                                        // : <Plus />
                                        ? <Check />//<CheckSquare />
                                        : <Square />
                                    }
                                    </div>
                                </div>
                                
                            </div>
                            {/* <input
                                type="date"
                                // value={newDate}
                                defaultValue={new Date().toLocaleDateString('en-CA').toString()}
                                onChange={onDateAdded}
                            /> */}
                            <DatePicker
                                onChange={onDateAdded}
                                selected={newDate}
                                // selected="2020-10-29"
                                dateFormat="yyyy-MM-dd"
                                // dateFormat="yyyy"
                                // defaultValue={new Date().toLocaleDateString('en-CA').toString()}
                            />
                            {
                                showingAdditionalDate && 
                                <div id="additional-datepicker">
                                    <DatePicker
                                        onChange={onAdditionalDateAdded}
                                        selected={additionalDate}
                                        dateFormat="yyyy-MM-dd"//"yyyy"
                                        // defaultValue={new Date().toLocaleDateString('en-CA').toString()}
                                    />
                                </div>
                            }
                        </div>

                        <div className="title-upload box">
                            <h4>Title</h4>
                            {/* <input value={newTitle} onChange={onTitleChange} /> */}
                            <TextEditor 
                                // value={newTitle} 
                                // value={RichTextEditor.createValueFromString(newTitle, 'html')}
                                initialValue={rteInitTitle}
                                value={RichTextEditor.createValueFromString(newTitle, 'html')}
                                onChange={onTitleChange} 
                            />
                        </div>
                        
                        <div className="text-upload box">
                            <h4>Content</h4>
                            {/* <textarea value={newText} onChange={onTextChange} /> */}
                            <TextEditor 
                                // value={newText} 
                                // value={RichTextEditor.createValueFromString(newText, 'html')}
                                initialValue={rteInitContent}
                                value={RichTextEditor.createValueFromString(newText, 'html')}
                                onChange={onTextChange} 
                                files={newFiles} // Pass files through to link to
                            />
                        </div>
                    </div>
                    
                    <Loading loading={showSaving} /> 
                </div>

                <div className={"overlay "+ (showingDeleteDialog ? "showing" : "")} onClick={()=>{setShowingDeleteDialog(false)}}></div>
                <div className={"deleteDialog " + (showingDeleteDialog ? "showing" : "")}>
                    <h4>Are you sure you want to delete this?</h4>
                    <div className="options-wrapper">
                        <div className="cancel" onClick={()=>{setShowingDeleteDialog(false);}}>
                            <span>Cancel</span>
                        </div>
                        <div className="ok" onClick={()=>{
                            deleteSectionContent(showingDeleteDialog, projectName, currentSection);
                            setShowingDeleteDialog(false);
                        }}>
                            <span>Ok</span>
                        </div>
                    </div>
                </div>
                
            </div>
            
            {/* <div>
                <label>Username</label>
                <input value={username} onChange={setUsername} />
                <label>Password</label>
                <input valu={password} onChange={setPassword} />
            </div> */}
        </div>
    )
}

const SectionContent = ({
    entry,
    projectName,
    sectionName,
    setShowingEdit,
    setShowingNew,
    setNewAudio,
    setNewImages,
    setNewFiles,
    setNewDate,
    setAdditionalDate,
    setNewTitle,
    setNewText,
    setShowingDeleteDialog,
    setRteInitTitle,
    setRteInitContent,
    setShowingAdditionalDate,
}) => {
    // console.log(entry);
    return(
        <div className="SectionContent">
            <div className="content">
                <div className="cms-media-wrapper">
                    {
                        // TODO Display images as small and in a grid
                        (entry.images && entry.images.length)
                        ? <LazyLoadImage src={entry.imageURL || entry.images[0].url} effect="blur" width="260px" 
                            // height="calc(100% - 54px)" 
                            height="fit-content"
                            alt="" />
                        : ""
                    }
                    {
                        (entry.audio && entry.audio.length)
                        ? <audio controls src={entry.audioURL || entry.audio[0].url} type=".mp3,audio/*"/>
                        : ""
                    }
                    {
                        entry.files && entry.files.length ?
                        <div className="file">
                            <Paperclip />
                            <p>{entry.files.length} resource{entry.files.length > 1 ? "s" : ""}</p>
                            {/* Could optionally add sizes here */}
                        </div>
                        : ""
                    }
                </div>
                <div className="right-content">
                    {/* {entry.imgUrl && <img src={entry.imgUrl} />}
                    {entry.audioURL && 
                        <audio controls>
                            <source src={entry.audioURL} type="audio/mpeg" />
                        </audio>
                    } */}
                    <div dangerouslySetInnerHTML={{__html: entry.title}} />
                    <div className="date-display-container">
                        {entry.date && <p className="date">{firebaseDate2DisplayDate(entry.date)}</p>}
                        {entry.additionalDate && <p className="additionalDate">{firebaseDate2DisplayDate(entry.additionalDate)}</p>}
                    </div>
                    <div className="contents" dangerouslySetInnerHTML={{__html:entry.content}} />
                </div>
            </div>
            <div>
                <div className="edit" onClick={()=>{
                    console.log('showing entry: ', entry);
                    setShowingEdit(entry);
                    setShowingNew(true);
                    setNewAudio(entry.audio || []);
                    setNewImages(entry.images || []);
                    setNewFiles(entry.files || []);
                    setNewDate(new Date(entry.date.seconds * 1000));
                    if(entry.additionalDate){
                        setShowingAdditionalDate(true);   
                    }
                    var ad = entry.additionalDate 
                        ? entry.additionalDate.seconds * 1000 
                        : Date.now();
                    // console.log("ad: ", ad);
                    setAdditionalDate(new Date(ad));
                    setNewTitle(entry.title || "");
                    setNewText(entry.content || "");

                    setRteInitTitle(entry.title || "");
                    setRteInitContent(entry.content || "");
                }}>
                    <Edit />
                </div>
                <div className="delete" onClick={()=>{
                    setShowingDeleteDialog(entry);
                }}>
                    <Trash2 />
                </div>
            </div>
        </div>
    )
}