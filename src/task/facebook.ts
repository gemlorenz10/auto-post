import { Utility, Log } from '../lib';
import { MyNightmare as Nightmare } from '../nightmare/nightmare';
import * as path from 'path'
import * as fs from 'fs';
// declare let protocol; // temporary
const argv = require('yargs').string('category').argv;

const util = new Utility();
const log = new Log();
// if (argv.pid === void 0) { console.log('no pid'); process.exit(1); }
// protocol.set(argv.pid);
// protocol.send('begin', (new Date).toLocaleTimeString());

class Facebook extends Nightmare {

    private serverUrl = 'https://m.facebook.com'
    private post = 'Hello!';

    private id = argv.id;
    private password = argv.password;

    constructor(defaultOptions) {
        super(defaultOptions);
        this.firefox();
    }

    /**
     * entry point of the script - It posts the content and the url of the image that is uploaded to sonub website.
     * 
     */
    async main() {
        //  get data from firebase        
        // if (this.post === null) log.fail('failed to get post from firebase');
        // else protocol.send('got post from firebase');

        await this.login();
        await this.publish();

       log.success();
    }

    private async login() {
        let $html = await this.get(this.serverUrl);

        let emailField = await this.waitAppear('input[name="email"]', 3);
        if( !emailField ){
            let loginPage = await this.waitAppear(`a[href='/login/?ref=dbl&fl&refid=8']`, 3);
            if(!loginPage) this.captureError('Unhandled page.')
            await this.get( this.serverUrl + '/login/?ref=dbl&fl&refid=8' );
        }

        emailField = await this.waitAppear('input[name="email"]', 3)
        if (!emailField) this.captureError('Unknown Error.')
        
        await this.insert('input[name="email"]', '');
        await this.wait(800)
        await this.insert('input[name="email"]', this.id);
        await this.insert('input[name="pass"]', '');
        await this.wait(800)
        await this.insert('input[name="pass"]', this.password);
        await this.click('input[name="login"]');

        let re = await this.waitDisappear('input[name="pass"]', 5);
        if (!re) this.captureError('Still in login page after timeout!.', );

        await this.get(this.serverUrl);

        let isLogin = await this.waitAppear(`a:contains('Logout')`, 5);
        if (!isLogin) await this.captureError('Failed login.')
    }
    /**
     * For publishing on facebook.
     */
    private async publish() {
        // shaping the post
        let content = util.textify(this.post);
        let postThis = content.trim();

        // await this.get(this.serverUrl + '/groups/' + this.argv.category);

        // let isGroupOpen = await this.waitAppear('a[name=groupMenuBottom]', 5);
        // if (!isGroupOpen) await this.captureError('captureError on opening group page.');

        let canPost = await this.waitAppear('textarea[name="xc_message"]');
        if (!canPost) await this.captureError('Cant find textarea to post.');

        await this.insert('textarea[name="xc_message"]', postThis);
        await this.click('input[name="view_post"]');

        // Verify post if posted.
        // pending?

        let isPending = await this.waitAppear(`a:contains('1 post requiring approval')`, 5);
        if (isPending) log.fail('Post pending.'); // or delete old and post another.
        // posted?
        let isPosted = await this.findPost(postThis);
        if (!isPosted) await this.captureError('Post not found.');
    }

    /**
     * Checks if a post exists in a span.( facebook usually put posts' text into span  )
     * @param query - string to find 
     */
    private async findPost(query: string) {
        let arr = query.trim().split('\n')
        let selector = `span:contains('${arr[0].trim()}')`; // cannot use for wait()
        let re = await this.waitAppear(selector);

        return re;
    }
    /**
     * It captures the current screen state and fires 'lib.exitProcess()' closing the script.
     * @param message 
     * @param filePath - where to save the captured image 
     * @param fileName - filename of the image.
     */
    private async captureError( message, filePath = path.join(__dirname, '..', 'screenshot'), fileName = util.timeStamp() + '-facebook.png' ){
        
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
        await this.screenshot( path.join(filePath, fileName) );
        log.fail(message + 'Check screenshot at :' + path.join(filePath, fileName) );    

    }   

}


let options = {
    show: false,
    x: 1408, y: 0, width: 360, height: 700,
    openDevTools: { mode: '' },
};
(new Facebook(options)).main();

