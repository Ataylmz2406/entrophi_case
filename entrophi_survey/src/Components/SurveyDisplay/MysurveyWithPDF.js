import React, { useState, useEffect, useRef } from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import json from './QuestionOne.js';

const MysurveyWithPDF = (props) => {
  // This state will hold data when the survey is completed or when we're in summary mode
  const [completedData, setCompletedData] = useState(props.initialData);
  
  const sleepChartRef = useRef(null);
  const exerciseChartRef = useRef(null);
  const sleepChartInstanceRef = useRef(null);
  const exerciseChartInstanceRef = useRef(null);

  // Apply the default theme.
  Survey.StylesManager.applyTheme("default");
  const surveyModel = new Survey.Model(json);
  
  // Override some settings.
  surveyModel.showProgressBar = "top";
  surveyModel.progressBarType = "pages";
  surveyModel.showCompletedPage = props.showCompletedPage !== undefined ? props.showCompletedPage : false;
  surveyModel.questionTitleTemplate = "{title} ({require}) {num} of {total}";
  surveyModel.pageNumberTemplate = "Page {current} of {total}";
  
  // If partial data is provided (from saved progress), load it into the survey model.
  useEffect(() => {
    if (props.initialData) {
      surveyModel.data = props.initialData;
      
      // If we're in summary mode, make sure completedData is set
      if (props.onlyShowSummary) {
        setCompletedData(props.initialData);
      }
    }
  }, [props.initialData, props.onlyShowSummary, surveyModel]);

  // Auto-save progress on every value change.
  surveyModel.onValueChanged.add((sender, options) => {
    if (!props.onlyShowSummary) { // Only save if we're not in summary mode
      localStorage.setItem("surveyData", JSON.stringify(sender.data));
    }
  });

  // When the survey is complete, update completedData.
  const onComplete = (survey) => {
    const surveyData = survey.data;
    setCompletedData(surveyData);
    if (props.onComplete) {
      props.onComplete(surveyData);
    }
    // Clear saved data since survey is now complete
    localStorage.removeItem("surveyData");
  };

  // Helper function to convert exercise code to readable name.
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

  // Process exercise data for the pie chart.
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

  // Render charts when the survey is completed (using completedData).
  useEffect(() => {
    if (!completedData) return;

    // Sleep chart.
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
              data: [completedData.question5, completedData.question6],
              backgroundColor: ['#003366', '#003366'],
              borderColor: '#003366',
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // Exercise pie chart.
    if (exerciseChartRef.current && completedData.question7 && completedData.question8) {
      if (exerciseChartInstanceRef.current) {
        exerciseChartInstanceRef.current.destroy();
      }
      const exerciseData = getExerciseData(completedData);
      exerciseChartInstanceRef.current = new Chart(exerciseChartRef.current, {
        type: 'pie',
        data: {
          labels: exerciseData.labels,
          datasets: [
            {
              label: 'Exercise Types',
              data: exerciseData.values,
              backgroundColor: exerciseData.labels.map((_, index) => 
                index % 2 === 0 ? '#003366' : '#FFFFFF'
              ),
              borderColor: '#003366',
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [completedData]);

  // Function to generate the PDF report.
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

  // Generate survey summary text (for completed surveys only).
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

  // Render the summary view (only when the survey is complete).
  const renderSummaryOnly = () => {
    if (!completedData) {
      console.error("Summary view requested but no completed data available");
      return <div>No survey data available</div>;
    }
    
    return (
      <div className="survey-summary">
        <h2>Survey Summary</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', paddingTop: '10px' }}>
          <button 
            onClick={() => generatePDF(completedData)} 
            className="download-pdf-btn"
            style={{ padding: '10px 15px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Download PDF Report
          </button>
          {props.showFinishButton && (
            <button 
              onClick={props.onFinish}
              className="finish-btn"
              style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Finish
            </button>
          )}
        </div>
        <div className="summary-section">
          <h3>Your Responses</h3>
          <ul>
            {getSurveySummary(completedData).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="charts-container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {completedData.question5 && (
            <div style={{ position: 'relative', height: '250px', width: '400px', margin: '10px' }}>
              <h3>Sleep Data</h3>
              <canvas ref={sleepChartRef} id="sleepChartCanvas" />
            </div>
          )}
          {completedData.question7 && completedData.question8 && (
            <div style={{ position: 'relative', height: '250px', width: '400px', margin: '10px' }}>
              <h3>Exercise Types</h3>
              <canvas ref={exerciseChartRef} id="exerciseChartCanvas" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // If we're in summary mode (props.onlyShowSummary), render only the summary.
  if (props.onlyShowSummary) {
    return renderSummaryOnly();
  }

  // Otherwise, render the survey interface.
  return (
    <div>
      <Survey.Survey model={surveyModel} onComplete={onComplete} />
    </div>
  );
};

export default MysurveyWithPDF;