import React, { useState, useCallback } from 'react';
import MysurveyWithPDF from './MysurveyWithPDF';

const SurveyOne = () => {
  // Load saved progress (partial survey data) from localStorage if it exists.
  const savedProgress = localStorage.getItem("surveyData");
  const initialPartialData = savedProgress ? JSON.parse(savedProgress) : null;
  
  // partialData holds the in-progress answers (if any),
  // completedData holds the final survey answers once complete.
  const [partialData, setPartialData] = useState(initialPartialData);
  const [completedData, setCompletedData] = useState(null);
  
  // view controls which UI is shown: 'resumePrompt', 'survey', or 'summary'
  const [view, setView] = useState(savedProgress ? 'resumePrompt' : 'survey');

  // onCompleteSurvey is triggered when the survey finishes.
  const onCompleteSurvey = useCallback((data) => {
    console.log("Survey completed:", data);
    setCompletedData(data);
    setView('summary');
  }, []);

  // Resume saved progress.
  const handleResume = () => {
    setView('survey');
  };

  // Start over clears saved progress.
  const handleStartOver = () => {
    localStorage.removeItem("surveyData");
    setPartialData(null);
    setView('survey');
  };

  // Restart resets all state to start a new survey.
  const handleRestart = () => {
    localStorage.removeItem("surveyData");
    setPartialData(null);
    setCompletedData(null);
    setView('survey');
  };

  const handleFinish = () => {
    // Optional: Do something when user clicks Finish on summary page
    console.log("Survey finished");
    // You could redirect to another page here if needed
  };

  return (
    <div className="App">
      {view === 'resumePrompt' && (
        <div>
          <p>You have saved progress. Would you like to continue your survey?</p>
          <button onClick={handleResume}>Continue Survey</button>
          <button onClick={handleStartOver}>Start Over</button>
        </div>
      )}

      {view === 'survey' && (
        <MysurveyWithPDF 
          onComplete={onCompleteSurvey} 
          showCompletedPage={false}
          initialData={partialData}
        />
      )}
      
      {view === 'summary' && (
        <div>
          <MysurveyWithPDF 
            initialData={completedData} 
            onlyShowSummary={true}
            showFinishButton={true}
            onFinish={handleFinish}
          />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={handleRestart}
              style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Restart Survey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyOne;