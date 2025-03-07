import React, { useState, useEffect, useRef } from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import json from './QuestionOne.js'; // Adjust the path as needed

const MysurveyWithPDF = (props) => {
  const [surveyData, setSurveyData] = useState(props.initialData || null);
  const sleepChartRef = useRef(null);
  const exerciseChartRef = useRef(null);
  const sleepChartInstanceRef = useRef(null);
  const exerciseChartInstanceRef = useRef(null);

  // Configure Survey.js settings for progress indicators
  Survey.StylesManager.applyTheme("default");
  const surveyModel = new Survey.Model(json);
  
  // Add page numbers and question counts
  surveyModel.showProgressBar = "top";
  surveyModel.progressBarType = "pages";
  surveyModel.showCompletedPage = props.showCompletedPage !== undefined ? props.showCompletedPage : false;
  
  // Display page X of Y
  surveyModel.questionTitleTemplate = "{title} ({require}) {num} of {total}";
  surveyModel.pageNumberTemplate = "Page {current} of {total}";
  
  // Load initial data if provided
  useEffect(() => {
    if (props.initialData) {
      setSurveyData(props.initialData);
    }
  }, [props.initialData]);

  // Called when survey is complete
  const onComplete = (survey) => {
    setSurveyData(survey.data);
    if (props.onComplete) {
      props.onComplete(survey.data);
    }
  };

  // Helper function to convert exercise code to readable name
  const getExerciseName = (code) => {
    const exerciseMap = {
      "Item 1": "Fitness",
      "Item 2": "Yoga",
      "Item 3": "Pilates",
      "Item 4": "Swimming",
      "Item 5": "Boxing"
    };
    return exerciseMap[code] || code;
  };

  // Process exercise data for pie chart
  const getExerciseData = (data) => {
    if (!data || !data.question8) return { labels: [], values: [] };
    
    let exerciseTypes = [];
    if (Array.isArray(data.question8)) {
      const exerciseMap = new Map();
      data.question8.forEach(item => {
        let label = getExerciseName(item);
        exerciseMap.set(label, (exerciseMap.get(label) || 0) + 1);
      });
      exerciseTypes = Array.from(exerciseMap).map(([key, value]) => ({ type: key, count: value }));
    }
    return {
      labels: exerciseTypes.map(ex => ex.type),
      values: exerciseTypes.map(ex => ex.count)
    };
  };

  // Render charts when surveyData is available
  useEffect(() => {
    if (!surveyData) return;

    // Sleep chart
    if (sleepChartRef.current) {
      if (sleepChartInstanceRef.current) {
        sleepChartInstanceRef.current.destroy();
      }
      sleepChartInstanceRef.current = new Chart(sleepChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Sleep Hours', 'Sleep Rating'],
          datasets: [
            {
              label: 'Sleep Data',
              data: [surveyData.question5, surveyData.question6],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
              ],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // Exercise pie chart
    if (exerciseChartRef.current && surveyData.question7 && surveyData.question8) {
      if (exerciseChartInstanceRef.current) {
        exerciseChartInstanceRef.current.destroy();
      }
      const exerciseData = getExerciseData(surveyData);
      exerciseChartInstanceRef.current = new Chart(exerciseChartRef.current, {
        type: 'pie',
        data: {
          labels: exerciseData.labels,
          datasets: [
            {
              label: 'Exercise Types',
              data: exerciseData.values,
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [surveyData]);

  // Function to generate the PDF report
  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('User Registration Survey Report', 10, 15);
    doc.setFontSize(12);
    
    doc.text(`Name: ${data.question1}`, 10, 30);
    doc.text(`Height: ${data.question2} cm`, 10, 40);
    doc.text(`Weight: ${data.question3} kg`, 10, 50);
    doc.text(`Birth Date: ${data.question4}`, 10, 60);
    doc.text(`Sleep Hours (avg): ${data.question5 || 'N/A'}`, 10, 70);
    doc.text(`Sleep Rating: ${data.question6 ? data.question6 + ' stars' : 'N/A'}`, 10, 80);
    
    if (data.question7) {
      doc.text(`Exercise: Yes`, 10, 90);
      if (data.question8 && Array.isArray(data.question8)) {
        const exerciseNames = data.question8.map(getExerciseName).join(', ');
        doc.text(`Exercise Types: ${exerciseNames}`, 10, 100);
      }
    } else {
      doc.text(`Exercise: No`, 10, 90);
    }
    
    if (data.question9) {
      doc.text(`Aware of Caloric Intake: Yes`, 10, 110);
      if (data.question10) {
        doc.text(`Average Calories: ${data.question10}`, 10, 120);
      }
    } else {
      doc.text(`Aware of Caloric Intake: No`, 10, 110);
    }

    let adviceText = '';
    if (!data.question7 && data.question9) {
      adviceText = 'Although you know your caloric intake, regular exercise is essential to maintain overall health. Consider incorporating moderate activities into your routine.';
    } else if (!data.question9) {
      adviceText = 'It appears you may not be fully aware of your caloric intake. Proper nutrition is a cornerstone of a healthy lifestyle. Consider tracking your nutrition and seeking professional advice.';
    } else {
      adviceText = 'Your responses indicate a balanced approach to your health. Keep up the good work!';
    }
    doc.text('Health Recommendation:', 10, 130);
    doc.text(adviceText, 10, 140, { maxWidth: 190 });

    if (sleepChartRef.current) {
      const sleepChartImage = sleepChartRef.current.toDataURL('image/png', 1.0);
      doc.text('Sleep Data Chart:', 10, 170);
      doc.addImage(sleepChartImage, 'PNG', 10, 180, 90, 50);
    }
    
    if (exerciseChartRef.current && data.question7 && data.question8) {
      const exerciseChartImage = exerciseChartRef.current.toDataURL('image/png', 1.0);
      doc.text('Exercise Distribution:', 110, 170);
      doc.addImage(exerciseChartImage, 'PNG', 110, 180, 90, 50);
    }

    doc.save('survey_report.pdf');
  };

  // Generate survey summary text
  const getSurveySummary = (data) => {
    if (!data) return [];
    
    let summary = [];
    summary.push(`Name: ${data.question1}`);
    summary.push(`Height: ${data.question2} cm, Weight: ${data.question3} kg`);
    summary.push(`Birth Date: ${data.question4}`);
    summary.push(`Sleep: ${data.question5 ? data.question5 + ' hours' : 'N/A'} with a quality rating of ${data.question6 ? data.question6 + '/5' : 'N/A'}`);
    
    if (data.question7) {
      if (data.question8 && Array.isArray(data.question8)) {
        const exerciseNames = data.question8.map(getExerciseName).join(', ');
        summary.push(`Exercise Types: ${exerciseNames}`);
      } else {
        summary.push('Exercise: Yes');
      }
    } else {
      summary.push('Exercise: No');
    }
    
    if (data.question9) {
      if (data.question10) {
        summary.push(`Daily Caloric Intake: ${data.question10} calories`);
      } else {
        summary.push('Aware of Caloric Intake: Yes');
      }
    } else {
      summary.push('Aware of Caloric Intake: No');
    }
    
    return summary;
  };

  // Render the summary section only
  const renderSummaryOnly = () => {
    return (
      <div className="survey-summary">
        <h2>Survey Summary</h2>
        {/* Flex container for buttons aligned to the left */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', paddingTop: '10px' }}>
          <button 
            onClick={() => generatePDF(surveyData)} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Download PDF Report
          </button>
          {props.showFinishButton && (
            <button 
              onClick={props.onFinish}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Finish
            </button>
          )}
        </div>
        <div className="summary-section">
          <h3>Your Responses</h3>
          <ul>
            {getSurveySummary(surveyData).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="charts-container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {surveyData.question5 && (
            <div style={{ position: 'relative', height: '250px', width: '400px', margin: '10px' }}>
              <h3>Sleep Data</h3>
              <canvas ref={sleepChartRef} id="sleepChartCanvas" />
            </div>
          )}
          {surveyData.question7 && surveyData.question8 && (
            <div style={{ position: 'relative', height: '250px', width: '400px', margin: '10px' }}>
              <h3>Exercise Types</h3>
              <canvas ref={exerciseChartRef} id="exerciseChartCanvas" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {props.onlyShowSummary ? (
        renderSummaryOnly()
      ) : (
        props.showSurvey !== false && (
          <Survey.Survey model={surveyModel} onComplete={onComplete} />
        )
      )}
      
      {surveyData && !props.onlyShowSummary && (
        <div>
          <h2>Survey Summary</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', paddingTop: '10px' }}>
            <button 
              onClick={() => generatePDF(surveyData)} 
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Download PDF Report
            </button>
            {props.showFinishButton && (
              <button 
                onClick={props.onFinish}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Finish
              </button>
            )}
          </div>
          <div className="summary-section">
            <h3>Your Responses</h3>
            <ul>
              {getSurveySummary(surveyData).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="charts-container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            {surveyData.question5 && (
              <div style={{ position: 'relative', height: '250px', width: '400px', margin: '10px' }}>
                <h3>Sleep Data</h3>
                <canvas ref={sleepChartRef} id="sleepChartCanvas" />
              </div>
            )}
            {surveyData.question7 && surveyData.question8 && (
              <div style={{ position: 'relative', height: '250px', width: '400px', margin: '10px' }}>
                <h3>Exercise Types</h3>
                <canvas ref={exerciseChartRef} id="exerciseChartCanvas" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MysurveyWithPDF;
