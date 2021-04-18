import React from 'react'

import CMS from 'react-firestore-cms'
import 'react-firestore-cms/dist/cms.css';
import 'react-firestore-cms/dist/loading.css';
import 'react-firestore-cms/dist/index.css';
import 'react-firestore-cms/dist/app.css';

const App = () => {
  return <CMS projectName="bush_and_beyond" />
}

export default App
