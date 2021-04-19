import React from 'react'
import './index.css';

import CMS from 'react-firestore-cms'
import 'react-firestore-cms/dist/cms.css';
import 'react-firestore-cms/dist/loading.css';
import 'react-firestore-cms/dist/index.css';
import 'react-firestore-cms/dist/app.css';

const MyWebsite = () => {
  const data = {
    name: "Jason",
    surname: "Briggs",
    description: "This is a paragraph that can be changed by pressing the edit button on the bottom right.",
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

  return (
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
  );
}

const App = () => {
  return <CMS projectName="bush_and_beyond"/*"test_project"*/ children={<MyWebsite />} />
}

export default App
