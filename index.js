const express = require('express');
const bodyParser = require('body-parser');
const app = express()

var console_events = new Map();
app.use(express.json());

app.post('/consent-listener', (req, res) => {
    console.log("received audit request", req.body);

    var payload = req.body;

    console.log("received audit request payload", payload);

    //ignore if event is not consent related

    var audit_events = req.body.audit_events;

    if(audit_events != null) {

        audit_events.forEach(function(e) {
            //check if event is consent related
            if(e.event_subject === 'consent') {
                    
                    //payload key
                    var payload_key = e.event_subject + '_' + e.action;
                    var consent_id = e.payload[payload_key].consent.id;
                    var consent_status = e.payload[payload_key].consent.details.cdr.status;
                    var consent_updatedAt = e.payload[payload_key].consent.details.cdr.updated_at;
                    var consent_expiry = e.payload[payload_key].consent.details.cdr.expiry;
                    
                    var consent_record = {
                        "consent_action": e.action,
                        "consent_status": consent_status,
                        "consent_updatedAt": consent_updatedAt,
                        "consent_expiry": consent_expiry,
                    }

                    console.log('New consent record', consent_id, consent_record);

                    //check if a record exists
                    var consentRecord = console_events.get(consent_id);

                    var contentToPush = [];
                    if(consentRecord) {
                        contentToPush = consentRecord;
                    }
                    console.log('updatedConsent', contentToPush);

                    console_events.set(consent_id, contentToPush);
            } else {
                console.log('ignoring audit event of subject type', e.event_subject)
            }
       });
    
    }

    res.send();
})

app.get('/consent-events', (req,res) => {
    console.log("retrieving consent request");
    var events = Object.fromEntries(console_events);

    res.send(events);
    //show current active events in queue
})

app.listen(3000, () => console.log('Consent listener app listening on port 3000!'))
