import React, { useState, useCallback } from 'react'; 
import Mysurvey from '../SurveyTypes/SurveyTypeTwo';

const SurveyOne = () => {
    const [showPage, setShowPage] = useState(true);
    
    const onCompletePage = useCallback((data) => {
        console.log(data);
        setShowPage(!showPage);
    }, [showPage]);

    const setFinalPage = () => {
        return (
            <main>
                <h1>Thank you for completing the survey 2!</h1>
                <p>Click here to return to the home page</p>
            </main>
        );
    };

    return (
        <div className="App">
            {showPage ? (
                <Mysurvey showCompletedPage={(data) => onCompletePage(data)} />
            ) : (
                setFinalPage() // Call the function instead of assigning it
            )}
        </div>
    );
};

export default SurveyOne;
