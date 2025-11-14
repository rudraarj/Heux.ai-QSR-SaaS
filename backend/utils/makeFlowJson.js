const numberLabels = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY', 'TWENTY_ONE', 'TWENTY_TWO', 'TWENTY_THREE', 'TWENTY_FOUR', 'TWENTY_FIVE', 'TWENTY_SIX', 'TWENTY_SEVEN', 'TWENTY_EIGHT', 'TWENTY_NINE', 'THIRTY', 'THIRTY_ONE', 'THIRTY_TWO', 'THIRTY_THREE', 'THIRTY_FOUR', 'THIRTY_FIVE', 'THIRTY_SIX', 'THIRTY_SEVEN', 'THIRTY_EIGHT', 'THIRTY_NINE', 'FORTY', 'FORTY_ONE', 'FORTY_TWO', 'FORTY_THREE', 'FORTY_FOUR', 'FORTY_FIVE', 'FORTY_SIX', 'FORTY_SEVEN', 'FORTY_EIGHT', 'FORTY_NINE', 'FIFTY'];



// Helper function to convert sections to WhatsApp Flow JSON
function convertSectionToFlowJson(sectionId, sectionName, questions) {
    const data = {};

    const screens = questions.map((question, questionIndex) => {
        const children = [];

        // Add questions
        const fieldName = `${sectionId}_${question.id}`.replaceAll('-','_');

        // Add question text
        children.push({
            type: "TextSubheading",
            text: question.text
        });

        // Add input field based on question type
        switch (question.type || 'yes_no') {
            // case 'rating':
            //     children.push({
            //         type: "RadioButtonsGroup",
            //         label: "Rate",
            //         name: fieldName,
            //         "data-source": [
            //             { id: "rating_one", title: "1" },
            //             { id: "rating_two", title: "2" },
            //             { id: "rating_three", title: "3" },
            //             { id: "rating_four", title: "4" },
            //             { id: "rating_five", title: "5" }
            //         ],
            //         required: true
            //     });
            //     break;

            // case 'number':
            //     children.push({
            //         type: "TextInput",
            //         label: "Enter number",
            //         name: fieldName,
            //         "input-type": "number",
            //         required: true
            //     });
            //     break;

            // case 'text':
            //     children.push({
            //         type: "TextArea",
            //         label: "Your answer",
            //         name: fieldName,
            //         required: false
            //     });
            //     break;
                
            case 'yes_no':
            default:
                children.push({
                    type: "RadioButtonsGroup",
                    label: "Choose one",
                    name: fieldName,
                    "data-source": [
                        { id: "yes", title: "Yes" },
                        { id: "no", title: "No" }
                    ],
                    required: true
                });
                break;

        }

        // Build payload for form submission for this screen
        const payload = {};
        payload[fieldName] = `\${form.${fieldName}}`;

        // update payload for reciveded response in this screen
        Object.keys(data).map((key) => {
            payload[key] = `\${data.${key}}`
        })

        // Add footer/submit button
        const isLastQuestion = questionIndex === questions.length - 1;
        const nextScreenId = !isLastQuestion
            ? `SCREEN_${numberLabels[questionIndex + 1]}`
            : null;

        children.push({
            type: "Footer",
            label: isLastQuestion ? "Submit" : "Continue",
            "on-click-action": {
                name: isLastQuestion ? "complete" : "navigate",
                payload: payload,
                ...(isLastQuestion ? {} : { next: { type: "screen", name: nextScreenId } })
            }
        });

        const onjectToReturn = {
            id: `SCREEN_${numberLabels[questionIndex]}`,
            title: sectionName,
            ...(isLastQuestion && {
                terminal: true,
                success: true
            }),
            data: { ...data },
            layout: {
                type: "SingleColumnLayout",
                children: [
                    {
                        type: "Form",
                        name: `form`,
                        children: children
                    }
                ]
            }
        };

        data[fieldName] = {
            "type": "string",
            "__example__": "Example"
        }

        return onjectToReturn
    });

    return {
        version: "7.2",
        screens: screens
    };
}


module.exports = convertSectionToFlowJson;