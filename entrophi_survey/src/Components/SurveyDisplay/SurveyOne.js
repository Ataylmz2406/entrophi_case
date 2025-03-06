import React, { useState, useCallback } from 'react';
import MysurveyWithPDF from './MysurveyWithPDF';

const SurveyOne = () => {
  const [showPage, setShowPage] = useState(true);

  const onCompletePage = useCallback((data) => {
    console.log(data);
    setShowPage(false);
  }, []);

  const setFinalPage = () => (
    <main>
      <h1>Thank you for completing the survey!</h1>
      <p>Click here to return to the home page</p>
    </main>
  );

  return (
    <div className="App">
      {showPage ? (
        <MysurveyWithPDF onComplete={onCompletePage} />
      ) : (
        setFinalPage()
      )}
    </div>
  );
};

export default SurveyOne;
