import React, { useState, useCallback } from 'react';
import MysurveyWithPDF from './MysurveyWithPDF';

const SurveyOne = () => {
  const [showSurvey, setShowSurvey] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [surveyData, setSurveyData] = useState(null);
  
  // Called when survey is complete
  const onCompleteSurvey = useCallback((data) => {
    setSurveyData(data);
    setShowSurvey(false);
    setShowSummary(true);
  }, []);
  
  // Called when the user clicks finish
  const onFinish = useCallback(() => {
    setShowSummary(false);
  }, []);

  const renderFinalPage = () => (
    <main>
      <h1>Thank you for completing the survey!</h1>
      <p>Click here to return to the home page</p>
    </main>
  );

  return (
    <div className="App">
      {showSurvey && (
        <MysurveyWithPDF 
          onComplete={onCompleteSurvey} 
          showCompletedPage={false}
        />
      )}
      
      {showSummary && surveyData && (
        <div>
          <MysurveyWithPDF 
            initialData={surveyData} 
            showSurvey={false} 
            onlyShowSummary={true}
            showFinishButton={true}
            onFinish={onFinish}
          />
        </div>
      )}
      
      {!showSurvey && !showSummary && renderFinalPage()}
    </div>
  );
};

export default SurveyOne;