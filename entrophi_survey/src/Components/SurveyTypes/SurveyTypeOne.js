import React from 'react';
import 'survey-react/survey.css';
import * as Survey from 'survey-react';
import json from '../Surveys/QuestionOne';

const Mysurvey = () => {
    return <Survey.Survey json={json} />;
};

export default Mysurvey;
