const { App } = require('@slack/bolt');
const { google } = require('googleapis');
const sheets = google.sheets('v4');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: process.env.PORT || 3000
});

// Google Sheets authentication
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Store the current week's rotating question
let currentRotatingQuestion = {
  text: "Do you have clarity on what's expected of you in your role?",
  id: "clarity_role"
};

// Post the weekly pulse message
async function postWeeklyPulse(channel) {
  try {
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      text: "Time for this week's Gecko Pulse 👋",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "👋 Time for this week's Gecko Pulse",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Quick weekly check-in to help us spot blockers early and keep things running smoothly.\n\nTakes about 60 seconds. Your manager will see your responses so they can support you."
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Fill This Week's Pulse",
                emoji: true
              },
              style: "primary",
              action_id: "open_pulse_modal"
            }
          ]
        }
      ]
    });
    
    console.log('Weekly pulse posted successfully');
    return result;
  } catch (error) {
    console.error('Error posting pulse:', error);
    throw error;
  }
}

// Handle button click to open modal
app.action('open_pulse_modal', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'pulse_submission',
        title: {
          type: 'plain_text',
          text: 'Gecko Pulse'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*How\'s your week going?*'
            }
          },
          {
            type: 'actions',
            block_id: 'week_score',
            elements: [
              {
                type: 'radio_buttons',
                action_id: 'week_rating',
                options: [
                  {
                    text: { type: 'plain_text', text: '1 - Struggling', emoji: true },
                    value: '1'
                  },
                  {
                    text: { type: 'plain_text', text: '2', emoji: true },
                    value: '2'
                  },
                  {
                    text: { type: 'plain_text', text: '3', emoji: true },
                    value: '3'
                  },
                  {
                    text: { type: 'plain_text', text: '4', emoji: true },
                    value: '4'
                  },
                  {
                    text: { type: 'plain_text', text: '5 - Great', emoji: true },
                    value: '5'
                  }
                ]
              }
            ]
          },
          {
            type: 'divider'
          },
          {
            type: 'input',
            block_id: 'comment_block',
            optional: true,
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'comment_input',
              placeholder: {
                type: 'plain_text',
                text: 'Share wins, blockers, or anything flying under the radar...'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Wins, blockers, or things flying under the radar? 🚩'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${currentRotatingQuestion.text}*`
            }
          },
          {
            type: 'actions',
            block_id: 'rotating_score',
            elements: [
              {
                type: 'radio_buttons',
                action_id: 'rotating_rating',
                options: [
                  {
                    text: { type: 'plain_text', text: '1 - Very unclear', emoji: true },
                    value: '1'
                  },
                  {
                    text: { type: 'plain_text', text: '2', emoji: true },
                    value: '2'
                  },
                  {
                    text: { type: 'plain_text', text: '3', emoji: true },
                    value: '3'
                  },
                  {
                    text: { type: 'plain_text', text: '4', emoji: true },
                    value: '4'
                  },
                  {
                    text: { type: 'plain_text', text: '5 - Crystal clear', emoji: true },
                    value: '5'
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// Handle modal submission
app.view('pulse_submission', async ({ ack, body, view, client }) => {
  await ack();

  const userId = body.user.id;
  const values = view.state.values;

  // Get user info
  const userInfo = await client.users.info({ user: userId });
  const userEmail = userInfo.user.profile.email;
  const userName = userInfo.user.real_name;

  // Extract responses
  const weekScore = values.week_score?.week_rating?.selected_option?.value || '';
  const comment = values.comment_block?.comment_input?.value || '';
  const rotatingScore = values.rotating_score?.rotating_rating?.selected_option?.value || '';

  // Save to Google Sheets
  try {
    const authClient = await auth.getClient();
    
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      userEmail,
      userName,
      weekScore,
      comment,
      rotatingScore,
      currentRotatingQuestion.text
    ];

    await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
      range: 'Responses!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [row]
      }
    });

    console.log('Response saved to Google Sheets');

    // Send confirmation DM
    await client.chat.postMessage({
      channel: userId,
      text: "Thanks for completing this week's pulse! Your manager will review responses this week."
    });

  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    
    // Send error message
    await client.chat.postMessage({
      channel: userId,
      text: "Sorry, there was an error saving your response. Please let Ruth know."
    });
  }
});

// Endpoint to trigger weekly pulse (call this from a cron job)
app.command('/send-pulse', async ({ command, ack, say }) => {
  await ack();
  
  // Only allow specific users to trigger this
  const allowedUsers = process.env.ADMIN_USER_IDS?.split(',') || [];
  
  if (!allowedUsers.includes(command.user_id)) {
    await say('You do not have permission to send the pulse.');
    return;
  }

  const channel = process.env.PULSE_CHANNEL || 'general';
  await postWeeklyPulse(channel);
  await say('Weekly pulse posted!');
});

// Endpoint for updating the rotating question
app.command('/update-question', async ({ command, ack, say }) => {
  await ack();
  
  const allowedUsers = process.env.ADMIN_USER_IDS?.split(',') || [];
  
  if (!allowedUsers.includes(command.user_id)) {
    await say('You do not have permission to update questions.');
    return;
  }

  // Parse the question from the command text
  const questionText = command.text.trim();
  
  if (!questionText) {
    await say('Please provide a question. Usage: `/update-question Your question here?`');
    return;
  }

  currentRotatingQuestion = {
    text: questionText,
    id: Date.now().toString()
  };

  await say(`Rotating question updated to: "${questionText}"`);
});

// Health check endpoint
app.event('app_home_opened', async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Welcome to Gecko Pulse!* 👋'
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Every Thursday, you\'ll get a quick pulse check to help us spot blockers early and keep things running smoothly.'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error publishing home tab:', error);
  }
});

(async () => {
  await app.start();
  console.log('⚡️ Gecko Pulse app is running!');
})();

// Export for serverless
module.exports = app;
