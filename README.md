# react-firestore-cms

> A CMS (Content Management System) using React with a Firestore backend, that lets clients of Web Developers update their webpage content freely. An alternative to Wordpress.

[![NPM](https://img.shields.io/npm/v/react-firestore-cms.svg)](https://www.npmjs.com/package/react-firestore-cms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## How this works.

This is a CMS to be plugged into your React website clientside to create management of content. 

The CMS can be placed at a child URL.

## Live Demo

https://gieoon.github.io/react-firestore-cms/

### Core Features:

#### Authentication:

Authentication is via Google accounts. There is no nede to rememebr an additional password.
- A user must be authenticated to edit their content.
- Once authenticated, only that user (via Google account) and one audit email address can be used to edit content.
- Each user can only edit content under their own project name. This is determined through Firebase rules and is hidden from the user.

#### Updating Website Content

Clients frequently want to update content on their websites. This has been simplified. Insted of navigating to <my-example-domain>/wp-login, you can create any location (Including subdomains) to host this CMS.
- The user sees their own website with the editable fields greyed out.
- After editing and saving, the new content will save into Firestore.
- The website loads the data to display to the end user.

##### Caveats of this approach.
- Data is no longer static, but comes from a Firestore Database, and potentially slower to load. I'm working on a solution for this.

#### Products:

The CMS handles a list of dynamic entries and uses file storage to create and save content.
These dynamic entries can be for e-commerce products, blog posts, or other forms of data that need to be updated.
This can be displayed in e-commerce format.
- Authenticated users can store files in Firebase Storage.

## Install

```bash
npm install --save react-firestore-cms
```

## Usage

```jsx
import React, { Component } from 'react';

/* 
    Your Firebase Configuration via 
    1. Firebase console
    2. Click on Project Settings to get this
    3. Save to an external folder and import here.
*/
import firebaseConfig from './config.js';
import CMS from 'react-firestore-cms';
import 'react-firestore-cms/dist/cms.css';
import 'react-firestore-cms/dist/loading.css';
import 'react-firestore-cms/dist/index.css';
import 'react-firestore-cms/dist/app.css';
  
class Example extends Component {
  constructor(super){
    state = {
      db: {}
    }
  }
  componentDidMount(){
    firebase.initializeApp(firebaseConfig);
    setState({
      db: firebase.firestore()
    });
  };

  render() {
    return <CMS 
      projectName="test" 
      children={<MyWebsite />} 
      db={this.state.db} 
      firebase={firebase}
      collectionName="CMS"
      collectionWebsiteContent="CMS_WebsiteContent" 
    />
  }
}
```


## Set up

#### In Firestore:
1. Create a collection to house website product information and use it for `collectionName`
2. Create another collection to house website content and use it as `collectionWebsiteContent`
3. Create an authentication collection that is write-only via rules.
4. Add the firebaseConfig to the project.
5. Add the class name `cp-editable` to each element you want to be able to edit.
6. Add id's to these elements separated by hyphens '-' for each child. 
###### For Objects:

This: `<div id="hello-world" className="cp-editable">{my-awesome-field}</div>` 
Becomes: `{ hello: {world: my-awesome-field} }`

###### And for objects in arrays:

This: 
```
<div id="hello-0-world" className="cp-editable">{my-awesome-field}</div>
<div id="hello-2-world" className="cp-editable">{my-awesome-field2}</div>
<div id="hello-3-world" className="cp-editable">{my-awesome-field3}</div>
```
Becomes: ```
  {
    hello: [
      {world: my-awesome-field},
      {world: my-awesome-field2},
      {world: my-awesome-field3}
    ] 
  }
```

## Props
These are what need to be prepared to use the CMS.

#### projectName: String

This is your Project/Website name.

#### children: React JSX Component

Your website HTML to render to edit content for.

#### db: firebase.firestore()

Firestore db root reference.

#### firebase: firebase

Reference to firebase.
Usually: `import firebase from 'firebase'`
Or, depending on the Firebase SDK version: `import * as firebase from 'firebase/app'`

#### collectionName: String

The Collection in Firestore where product items are stored.
Firestore will be structured as 

|Collection|Doc|Fields|
|collectionName|projectName|Fields|

Fields* consists of an object that looks like the following.
```
{
  projectName: String,
  sections: [],
  webpageEditable: true,
}
```

#### collectionWebsiteContent: String

The Collection in Firestore where website text content is stored.
This is structured in Firestore as:

|Collection|Doc|Fields|
|collectionName|projectName|Fields|

Fields* is a dynamically created object based on the id's you give to the components.

The following id names (taken from the example) will be saved as an object.
```
<div>
      <h4>This is a CMS sample, on the left is the CMS, and this is an example website.</h4>
      <h2>This header cannot be edited.</h2>
      <p id="description" className="cp-editable">{data.description}</p>
      <div style={{padding:"15px",margin:"auto"}}>
        <div id="name" className="cp-editable">{data.name}</div>
        <div id="surname" className="cp-editable">{data.surname}</div>
      </div>
      <p>This paragraph cannot be edited because it doesn't have the className 'cp-editable', or an id to be linked to the object in the Firstore database. If you look at the example source code you'll see what can be edited and what can't.</p>

      <h4>List of jobs</h4>
      <ul>
      {
        data.jobs.map((job, i) => (
          <li id={"jobs-"+i} className="cp-editable" style={{lineHeight:"2"}}>{job}</li>
        ))
      }
      </ul>
      <h4>Careers</h4>
      <div style={{display:"flex",justifyContent:"flex-start",flexWrap:"wrap"}}>
      {
        data.careers.map((career, i) => (
          <div style={{padding: "5px",margin:"15px 5px",borderRadius:"4px",border:"2px solid rgb(0,0,0,0.15)",backgroundColor:"rgb(245,245,245)"}}>
            <div id={"careers-"+i+"-title"} className="cp-editable" style={{margin:"10px 0"}}>Position: {career.title}</div>
            <div id={"careers-"+i+"-duration"} className="cp-editable">Duration: {career.duration} years</div>
          </div>
        ))
      }

      <div>
        <div id="details-volunteer_work" className="cp-editable">Activity: {data.details.volunteer_work}</div>
        <div id="details-qualifications1" className="cp-editable">Qualification: {data.details.qualifications1}</div>
        <div id="details-qualifications2" className="cp-editable">Qualification: {data.details.qualifications2}</div>
        <div>
          <p>This is a deep component with multiple children</p>
          <div id="details-qualifications3-text" className="cp-editable">Qualification: {data.details.qualifications3.text}</div>
          <div id="details-qualifications3-start" className="cp-editable">Start: {data.details.qualifications3.start}</div>
          <div id="details-qualifications3-end" className="cp-editable">End: {data.details.qualifications3.end}</div>
        </div>
      </div>
      </div>
    </div>
```

This becomes an object in Firestore:
```
{
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
}
```

## Disclaimer

I'm using this for my own websites as an alternative to Wordpress, and to host many websites from one location.

This is a work in progress, with features created based on demand.

I've experimented a little with iframes and hosting the CMS separately from the deployment location, apart from cross-domain iframe communication, the result is largely the same and depends on how you want to manage content. If the CMS is deployed separately with each project it will be bug free but a pain to update, but if it is deployed at a separate location, then it becomes a product of its own and is mroe scalable, but more prone to regressive bugs possibly appearing with future updates.

## License

MIT © [gieoon](https://github.com/gieoon)
