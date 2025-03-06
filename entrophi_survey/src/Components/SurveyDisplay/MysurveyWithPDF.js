import React, { useState, useEffect, useRef } from 'react';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import json from './QuestionOne.js'; // Adjust the path as needed

const MysurveyWithPDF = (props) => {
  const [surveyData, setSurveyData] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Called when survey is complete
  const onComplete = (survey) => {
    setSurveyData(survey.data);
  };

  // Render chart when surveyData is available
  useEffect(() => {
    if (surveyData && chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      // Create new chart instance
      chartInstanceRef.current = new Chart(chartRef.current, {
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
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
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
    doc.text(`Sleep Hours (avg): ${data.question5}`, 10, 70);
    doc.text(`Sleep Rating: ${data.question6} stars`, 10, 80);

    let adviceText = '';
    if (!data.question7 && data.question9) {
      adviceText =
        'Although you know your caloric intake, regular exercise is essential to maintain overall health. Consider incorporating moderate activities into your routine.';
    } else if (!data.question9) {
      adviceText =
        'It appears you may not be fully aware of your caloric intake. Proper nutrition is a cornerstone of a healthy lifestyle. Consider tracking your nutrition and seeking professional advice.';
    } else {
      adviceText =
        'Your responses indicate a balanced approach to your health. Keep up the good work!';
    }
    doc.text(adviceText, 10, 100, { maxWidth: 190 });

    if (chartRef.current) {
      const chartImage = chartRef.current.toDataURL('image/png', 1.0);
      doc.addImage(chartImage, 'PNG', 10, 120, 180, 100);
    }

    doc.save('survey_report.pdf');
  };

  return (
    <div>
      <Survey.Survey
        json={json}
        onComplete={onComplete}
        showCompletedPage={false}
      />
      {surveyData && (
        <div>
          <h3>Survey Summary</h3>
          <div style={{ position: 'relative', height: '200px', width: '400px' }}>
            <canvas ref={chartRef} id="chartCanvas" />
          </div>
          <button onClick={() => generatePDF(surveyData)}>
            Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
};

export default MysurveyWithPDF;
