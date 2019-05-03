const nodemailer = require('nodemailer');
const axios = require('axios');
const moment = require('moment');
require('dotenv').config();
require('moment-timezone');

const STOCK = process.env.STOCK;
const API_KEY = process.env.STOCK_API_KEY;

const mailer = (function () {

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(process.env.SMTP);


  function send(price) {
    // setup e-mail data with unicode symbols
    const mailOptions = {
      from: '"Mars" <mars@marstanjx.com>', // sender address
      to: 'jianxuat@usc.edu', // list of receivers
      subject: `${STOCK} Price Changed`, // Subject line
      text: `${STOCK}: $${price}`, // plaintext body
      html: `<b>${STOCK}: $${price}</b>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
  }

  return send;
})();

function log(msg) {
  console.log(`[${moment().tz('America/Los_Angeles').format('dddd, M/D/YYYY, h:mm:ss A')}] ${msg}`);
}

let last_highest_price = 17.72;

function update() {
  const time = moment.tz('America/New_York');
  const hour = time.hour();
  const minute = time.minute();
  if (hour < 9 || hour >= 17) {
    log(`It is ${time.format('ha z')} in New York.`);
    const timeout_minute = minute === 0 ? 60 : 60 - minute;
    setTimeout(update, timeout_minute * 60 * 1000);
    return;
  } else if (time.day() < 1 || time.day() > 5) {
    log(`It is ${time.format('dddd')} in New York.`);
    const timeout_hour = hour === 0 ? 24 : 24 - hour;
    setTimeout(update, timeout_hour * 60 * 60 * 1000);
    return;
  }

  // https://www.alphavantage.co/documentation/
  axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${STOCK}&apikey=${API_KEY}`)
    .then((res) => {
      const price = parseFloat(res['data']['Global Quote']['05. price']);

      log(`${STOCK} ${price}`);
      if (price > last_highest_price + 0.03) {
        mailer(price);
        last_highest_price = price;
      }
    });

  setTimeout(update, 15000);
}

log(`I'm tracking ${STOCK}`);
update();
