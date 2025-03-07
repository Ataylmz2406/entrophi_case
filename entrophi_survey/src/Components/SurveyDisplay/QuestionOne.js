const json = {
  "title": "User İnformation",
  "description": "Please enter your information.",
  "logo": "entrophico_logo.jpg",
  "logoWidth": 60,
  "logoHeight": 60,
  "pages": [
    {
      "name": "page1",
      "title": "Your information",
      "description": "Page 1 of 4",
      "elements": [
        {
          "type": "text",
          "name": "question1",
          "title": "What is your name",
          "isRequired": true
        },
        {
          "type": "text",
          "name": "question2",
          "title": "how tall are you in cm",
          "isRequired": true,
          "inputType": "number"
        },
        {
          "type": "text",
          "name": "question3",
          "title": "How much do you weigh in kg",
          "isRequired": true,
          "inputType": "number"
        },
        {
          "type": "text",
          "name": "question4",
          "title": "when were you born",
          "isRequired": true,
          "inputType": "date"
        }
      ]
    },
    {
      "name": "page2",
      "title": "Sleep",
      "description": "Page 2 of 4",
      "elements": [
        {
          "type": "rating",
          "name": "question5",
          "title": "How many hours do you sleep at night on average",
          "isRequired": true,
          "rateCount": 10,
          "rateMax": 10
        },
        {
          "type": "rating",
          "name": "question6",
          "title": "how would you rate your sleep on average",
          "isRequired": true,
          "rateType": "stars"
        }
      ]
    },
    {
      "name": "page3",
      "title": "Exercise",
      "description": "Page 3 of 4",
      "elements": [
        {
          "type": "boolean",
          "name": "question7",
          "title": "Do you exercise",
          "isRequired": true
        },
        {
          "type": "tagbox",
          "name": "question8",
          "visibleIf": "{question7} = true",
          "title": "What type of exercise",
          "choices": [
            {
              "value": "Item 1",
              "text": "Fitness"
            },
            {
              "value": "Item 2",
              "text": "Yoga"
            },
            {
              "value": "Item 3",
              "text": "Pilates"
            },
            {
              "value": "Item 4",
              "text": "Swimming"
            },
            {
              "value": "Item 5",
              "text": "Boxing"
            }
          ],
          "showOtherItem": true,
          "showSelectAllItem": true,
          "maxSelectedChoices": 6,
          "minSelectedChoices": 1
        }
      ]
    },
    {
      "name": "page4",
      "title": "Nutrition",
      "description": "Page 4 of 4",
      "elements": [
        {
          "type": "boolean",
          "name": "question9",
          "title": "Do you know your caloric intake",
          "isRequired": true
        },
        {
          "type": "text",
          "name": "question10",
          "visibleIf": "{question9} = true",
          "title": "How many calories do you consume on average ",
          "inputType": "number"
        }
      ]
    }
  ],
  "sendResultOnPageNext": true,
  "showPageNumbers": true,
  "questionErrorLocation": "bottom",
  "showProgressBar": "aboveheader",
  "progressBarShowPageTitles": true,
  "goNextPageAutomatic": true,
  "checkErrorsMode": "onValueChanged"
}

export default json;