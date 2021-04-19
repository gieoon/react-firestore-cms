import React, {useEffect, useState, ReactDOM} from 'react';
// import {useLocation} from 'react-router-dom';
// This is shared code for all CMS listeners.
// Listens to events from login.<domain-name>.craftie.xyz, 
// Edits the page after events are received.
import Quill from 'quill';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
import getCssSelector from 'css-selector-generator';
import { getDefaultKeyBinding } from 'draft-js';

const quills = {};

export default function UpdatePage({
    projectName,
    collectionWebsiteContent,
    db,
    frameLoaded,
}){
    
    useEffect(()=>{
        if(frameLoaded){
            highlightEditable();

            var interval = setInterval(() => {
                addEditButton();
            }, 1500);

            var head = getIframe().head;
            var link = getIframe().createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
            head.appendChild(link);
            return () => { 
                head.removeChild(link); 
                console.log('CLEARING INTERVAL');
                clearInterval(interval);
            }
        }
    }, [frameLoaded]);

    const getIframe = () => {
        var parent = document.querySelector('#editingFrame');
        if(parent)
            return parent.contentDocument;
        return undefined;
    }

    const addEditButton = () => {
        const elements = Array.from(
            getIframe().querySelectorAll('.cp-editable')
        );
        // console.log("editable elements: ", elements[2]);
        for(var el of elements){
            // console.log('el.querySelector(.cp-editable-btn): ', el.querySelector('.cp-editable-btn') === undefined);

            if(!el.querySelector('.cp-editable-btn')){
                // console.log('Adding button');
                const dw = getIframe().createElement('div');
                dw.classList.add("cp-editable-btn-wrapper");
                // console.log('Adding edit button to element: #', el, el.querySelector('.cp-editable-btn'));
                const d = getIframe().createElement('div');
                const editorContainer = getIframe().createElement('div');
                d.textContent = "Edit";
                // const img = document.createElement('img');
                // img.src = "";
                d.classList.add('cp-editable-btn');
                editorContainer.classList.add('editor');
                
                const d2 = getIframe().createElement('div');
                d2.textContent = "Save";
                d2.classList.add('cp-editable-save-btn');
                

                const d3 = getIframe().createElement('div');
                d3.textContent = "Cancel";
                d3.classList.add('cp-editable-cancel-btn');
                
                d2.onclick = (e) => {
                    saveClicked(e);
                }

                d3.onclick = (e) => {
                    cancelClicked();
                }
                
                d.onclick = (e) => {
                    createEditInput(e);
                }
                el.appendChild(editorContainer);
                dw.appendChild(d);
                dw.appendChild(d2);
                dw.appendChild(d3);
                el.appendChild(dw);
            }

        }
    }

    const cancelClicked = (e) => {
        var parentElement = e.target.closest('.cp-editable');
        parentElement.classList.toggle('editing');
        console.log('Cancel pressed')
        console.log(quills[getCssSelector(parentElement)].getText());
        // quills[getCssSelector(parentElement)].setText("");
        // Manually hide
        parentElement.querySelector('.ql-toolbar').style.display = "none";
        parentElement.querySelector('.ql-container').style.display = "none";

        // quills[getCssSelector(parentElement)].disable();//enable(false);
        // delete quills[getCssSelector(parentElement)];
        parentElement.textContent = quills[getCssSelector(parentElement)].getText();
        console.log("parentElement.textContent: ", parentElement.textContent);
    }

    const saveClicked = async (e) => {
        var parentElement = e.target.closest('.cp-editable');
        parentElement.classList.toggle('editing');

        // Update local DOM
        // var quill = quills[getCssSelector(parentElement)];
        var currentText = getIframe().querySelector('.ql-editor').textContent;//Not working => quill.getText();
        console.log('got text: ', currentText);

        parentElement.textContent = currentText;

        // Save all to DB
        
        // Creates id.
        // Converts hyphens to child component.
        // Converts numbers to sections of an array.
        //TODO testing data.
        const data = {
            name: "Jason",
            surname: "Briggs",
            description: "A paragraph that can be changed by pressing the edit button on the bottom right.",
            jobs: [
              "Software Engineer",
              "Automation Tester",
              "Developer Operations",
              "Marketing & Sales Coordinator",
              "Test Analyst"
            ],
            careers: [
              {
                title: "Automation Testing",
                duration: 2,
              },
              {
                title: "Junior Software Developer",
                duration: 5
              },
              {
                title: "Senior Software Developer",
                duration: 10,
              }
            ],
            details: {
                volunteer_work: "Working at the Orphanage",
                qualifications1: "Google Ads Master - 2020",
                qualifications2: "Google Ads Master - 2021",
                qualifications3: {
                  text: "2019 Kickstart Coding Challenge - Bronze",
                  start: "2019 Jan",
                  end: "2019 Nov",
                }
            }
          };
        const dbObj = /*data;*/await loadWebsiteContent() || {};
        console.log("Loaded dbObj: ", dbObj);
        var sections = parentElement.id.split(/-|~/g);
        // sections.unshift("obj");
        console.log("el.id: ", parentElement.id);
        console.log("sections: ", sections);
        var val = extractElementContent(parentElement);
        // Modifies dbObj by reference.
        /*var newObj = */createNestedObj(dbObj, sections, val);
        // console.log(JSON.stringify(newObj));
        console.log("Returned: ", dbObj);
        await saveWebsiteContent(dbObj);
    }

    // Creates a nested Object, retains existing values.
    // const createNestedObj = (obj, keys, val) => { 
    //     const lastKey = keys.pop();
    //     const lastObj = keys.reduce((obj, key) => 
    //         obj[key] = obj[key] || {}, 
    //         obj
    //     ); 
    //     console.log('lastObj: ', lastObj);
    //     console.log('lastKey: ', lastKey);
    //     lastObj[lastKey] = val;
    //     return lastObj;
    // };

    // const createNestedObj = ( base, names, values ) => {
    //     for( var i in names ) base = base[ names[i] ] = base[ names[i] ] || (values[i] || {});
    // };

    /*const createNestedObj = (obj, keyPath, value) => {
        var lastKeyIndex = keyPath.length-1;
        for (var i = 0; i < lastKeyIndex; ++ i) {
            var key = keyPath[i];
            console.log("Handling key: ", key);
            if (!(key in obj)){
                obj[key] = {}
            }
            obj = obj[key];
        }
        obj[keyPath[lastKeyIndex]] = value;
        console.log("RETURNING: ", obj);
        return obj;
    }*/
    /*
    var createNestedObj = function( base, names, value ) {
        // If a value is given, remove the last name and keep it for later:
        var lastName = arguments.length === 3 ? names.pop() : false;
    
        // Walk the hierarchy, creating new objects where needed.
        // If the lastName was removed, then the last object is not set yet:
        for( var i = 0; i < names.length; i++ ) {
            base = base[ names[i] ] = base[ names[i] ] || {};
        }
    
        // If a value was given, set it to the last name:
        if( lastName ) base = base[ lastName ] = value;
        
        // Return the last object in the hierarchy:
        return base;
    };
    */
    const createNestedObj = (obj, path, value) => {
        if (path.length === 1) {
            obj[path] = value
            return;
        }
        return createNestedObj(obj[path[0]], path.slice(1), value);
    }
    

    const loadWebsiteContent = async () => {
        // console.log('projectName: ', currentUid, projectName);
        return db.collection(collectionWebsiteContent)
            .doc(projectName)
            .get()
            .then(doc => {
                console.log(doc.data());
                return doc.data();
            })
            .catch(err => console.error("Error loading website content: ", err))
    };

    const saveWebsiteContent = async (obj) => {
        // console.log('projectName: ', currentUid, projectName);
        return db.collection(collectionWebsiteContent)
            .doc(projectName)
            .set(obj)
            .then(() => {
                return "Success";
            })
            .catch(err => console.error("Error saving website content: ", err))
    };

    const extractElementContent = (el) => {
        console.log('Extracting text from: ', el, el.textContent);
        return el.textContent.replace(/EditSaveCancel/,'');
    }

    const editClicked = (e) => {
        createEditInput(e);
    }

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        // [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        // [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['clean']                                         // remove formatting button
    ];

    const createEditInput = (e) => {
        console.log('Creating edit input');
        var el = e.target;
        var parentElement = el.closest('.cp-editable');
        parentElement.classList.toggle('editing');
        console.log('parentElement: ', parentElement);
        var m = parentElement.innerHTML.match(/^[^<]*/);
        var currentText = m[0].trim();
        var regexp = new RegExp(m[0]);
        
        // var inp = document.createElement("input");
        if(!parentElement.querySelector('.ql-toolbar')){
            
            var quill = new Quill(parentElement.querySelector('.editor'), { //getCssSelector(parentElement)
                modules: { toolbar: toolbarOptions },
                theme: 'snow'
            });
            // var currentText = parentElement.innerHTML;//.replace(/EditSaveCancel$/,'');
            // console.log('currentText: ', currentText);
             // Match until the first <, which denotes HTML postfixes.
            // console.log("m[0]: ", m[0]);
            // currentText = m[0].trim();
            // console.log('inner html: ', parentElement.innerHTML);
            // console.log("replaced: ", parentElement.innerHTML.replace(regexp, ''));
            
            quill.setText(currentText);
            parentElement.innerHTML = parentElement.innerHTML.replace(regexp, '');

            quills[getCssSelector(parentElement)] = quill;
        } else {
            // Editor already exists, just show it
            parentElement.querySelector('.ql-toolbar').style.display = "block";
            parentElement.querySelector('.ql-container').style.display = "block";
            // var currentText = parentElement.textContent;
            // currentText = currentText.replace(/EditSaveCancel$/,'');
            // currentText = m[0].trim();
            // var replaceText = new RegExp(currentText + "EditSaveCancel");
            parentElement.innerHTML = parentElement.innerHTML.replace(regexp, '');
            // quills[getCssSelector(parentElement)].setText(currentText);
        }

        // Redefine click events for buttons.
        parentElement.querySelector('.cp-editable-cancel-btn').onclick = (e) => {
            cancelClicked(e);
        }
        parentElement.querySelector('.cp-editable-save-btn').onclick = (e) => {
            saveClicked(e);
        }
    }



    const highlightEditable = () => {
        // console.log('Highlighting everything!!!');
        addEditButton();

        // Attach CSS to head
        const root = getIframe();
        // console.log("root: ", root);
        root.head.insertAdjacentHTML('beforeend', `
            <style>
                .cp-editable {
                    border: 2px solid black;
                    position: relative;
                }
                .cp-editable::after {
                    content: "";
                    background-color: rgba(0,0,0,0.1);
                    position: absolute;
                    bottom: 0;
                    top: 0;
                    left: 0;
                    right: 0;
                    pointer-events: none;
                }
                .cp-editable.editing::after {
                    opacity: 0;
                }
                .cp-editable-btn-wrapper {
                    position: absolute;
                    /* box-shadow: 0px 0px 2px rgba(255,255,255,0.5); */
                    z-index: 1;
                    right: 0;
                    bottom: -5px;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    transition: all 100ms ease-in-out;
                }
                .cp-editable-btn,
                .cp-editable-save-btn,
                .cp-editable-cancel-btn {
                    background-color: black;
                    color: white;
                    padding: 2px 4px;
                    width: 50px;
                    font-size: 12px;
                    border-radius: 4px;
                    border: 1px solid rgba(150,150,150,0.5);
                    cursor: pointer;
                    line-height: normal;
                    font-weight: 200;
                    margin-left: 5px;
                }
                .cp-editable-btn:hover,
                .cp-editable-save-btn:hover,
                .cp-editable-cancel-btn:hover {
                    background-color: rgb(50,50,50);
                }
                .cp-editable.editing .cp-editable-btn {
                    display: none;
                }
                .cp-editable .cp-editable-save-btn,
                .cp-editable .cp-editable-cancel-btn {
                    display: none;
                }
                .cp-editable.editing .cp-editable-save-btn,
                .cp-editable.editing .cp-editable-cancel-btn {
                    display: block;
                }
            </style>
        `)
    }

    return <React.Fragment />;
}

// for(var i=0;i<sections.length;i++){
        //     console.log('handling section: ', sections[i]);
        //     var numberMatch = sections[i].match(/([0-9]+)/);
        //     var stringMatch = sections[i].match(/([a-zA-Z0-9]+)/);
            
        //     if(stringMatch){
        //         console.log("stringMatch: ", stringMatch);
        //         path.push({
        //             action: "Dictionary",
        //             value: stringMatch[0]
        //         });
        //         // out[stringMatch[0]] = undefined;// extractElementContent(el);
        //     }
        //     else if(numberMatch){
        //         // Create array index.
        //         // Add previous index if it exists.
        //         path.push({
        //             action: "Array",
        //             value: numberMatch[0]
        //         })
        //         // out[numberMatch[0]] = undefined;//extractElementContent(el);
        //     }
        // }
        // return path;
        // for(var i=sections.length-1;0;i--){
        //     console.log('handling section: ', sections[i]);
        //     var numberMatch = sections[i].match(/([0-9]+)/);
        //     var stringMatch = sections[i].match(/([a-zA-Z0-9]+)/);
        //     if(numberMatch){
        //         // Create array index.
        //         out[numberMatch[0]] = extractElementContent(el);
        //     }
        //     else if(stringMatch){
        //         console.log("stringMatch: ", stringMatch);
        //         out[stringMatch[0]] = extractElementContent(el);
        //     }
        // }