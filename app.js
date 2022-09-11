const cheerio = require('cheerio');
const request = require('request');
const gTTS = require('gtts');

const express = require('express');

var bodyParser = require('body-parser');
const { get } = require('express/lib/response');
const testFolder = './public/';
const fs = require('fs');
const app = express();
app.set('view engine', 'ejs')
var port = process.env.PORT || 8080
app.use('/public', express.static(__dirname + '/public'));
// automatically pick platform
var urlencodedParser = bodyParser.urlencoded({ extended: false })
global.flag = false
const say = require('say')
voicesList = say.getInstalledVoices()
console.log(voicesList)

function convert(monTitre, stringWithNewLines) {

    shortName = monTitre.slice(0, 20);
    const myfile = shortName.replace(/\s/g, '-') + ".mp3"
    console.log('Converting text to mp3');
    var speech = stringWithNewLines;
    var gtts = new gTTS(speech, 'en');

    gtts.save("./public/media/" + myfile, function(err, result) {

        if (err) { throw new Error(err); }
        console.log("Text to speech converted!" + myfile);
        global.flag = true
        console.log(flag)
        return flag;
    });

    console.log()
}

function saytxt(monTitre, stringWithNewLines) {
    shortName = monTitre.slice(0, 25);
    const myfile = shortName.replace(/\s/g, '-') + ".wav"
    console.log('Converting text to mp3');
    var speech = stringWithNewLines;
    // Export spoken audio to a WAV file
    say.export(speech, 0.75, "./public/media/" + myfile, (err) => {
        if (err) {
            return console.error(err)
        }

        console.log('Text has been saved to hal.wav.')
    })
}


async function getarticle(urls) {

    request({
        method: 'GET',
        url: urls
    }, (err, res, body) => {

        if (err) return console.error(err);

        let $ = cheerio.load(body);

        let article = $('article');
        let title = $('title');
        montxt = article.text()
        monTitre = title.text()

        console.log(monTitre);
        console.log(montxt);

        const fs = require('fs');

        const stringWithNewLines = montxt.split(".").join(".\n");

        try {
            fs.writeFileSync('./txt.txt', stringWithNewLines);


            // file written successfully
        } catch (err) {
            console.error(err);
        }

        mp3 = convert(monTitre, stringWithNewLines)
            //mp3 = saytxt(monTitre, stringWithNewLines)

    });

}


app.post('/', urlencodedParser, async(req, res) => {

    console.log('Got body:', req.body);
    result = JSON.stringify(req.body.article_name)
    var cleaned = result.slice(1, -1);
    console.log(JSON.stringify(req.body.article_name))
    getarticle(cleaned)

    //res.send({ "status": 200 });
    function checkFlag() {

        if (flag === false) {
            console.log(flag)
            console.log('check')
            setTimeout(checkFlag, 1000); /* checks the flag every 100 milliseconds to see if article is converted*/
        } else {
            console.log('redirect')
            res.redirect('/')
            global.flag = false
        }
    }
    checkFlag();


});


app.get('/', (req, res) => {

    const filenames = fs.readdirSync('public/media')
    filenames.map((filename) => {
        const stats = fs.statSync('public/media');

        console.log(filename)
    })

    console.log(filenames)
    res.render('pages/index', {

        file: filenames.reverse()

    });


});

// app.get('/download', async(req, res) => {
//     console.log("ok")
//     res.render('pages/download');

// });

app.listen(port, () => {
    console.log(`App listening at port ${port}`)
})
