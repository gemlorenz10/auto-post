const $ = require('cheerio');

export class Utility{
    constructor(){}
    /**
     * 
     * @param html - must be an HTML string.
     * 
     */
    textify(html: string): string {
        let re = '';

        html = html.replace(/\r/g, '');
        html = html.replace(/\n/g, '');
        html = html.replace(/\s+/g, ' ');

        html = html.replace(/<p>/ig, '');
        html = html.replace(/<\/p>/ig, "\n");
        html = html.replace(/<div>/ig, '');
        html = html.replace(/<\/div>/ig, "\n");


        const $html = $.load(html)('body');



        re = $html.text();


        const $a = $html.find('a');
        let aDone = [];
        if ($a.length) {
            $a.each((i, e) => {
                const txt = $(e).text();
                if (aDone.indexOf(txt) !== -1) return;
                const url = $(e).prop('href');
                re = re.split(txt).join(`${txt} (${url}) `);
                aDone.push(txt);
            });
        }

        // console.log(aDone);

        return re;
    }
    /**
     * Returns time in year, month, date, hour, minutes, seconds(2017-10-6-17-24-58)
     */
    timeStamp() {
        let date = new Date;
        return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()].join('-');
    }
}

export class Log {
    success( message = 'Script successful.' ) {
        this.exitProcess('success', message, );
    }

    fail( message = 'Script failed!' ) {
        this.exitProcess('fail', message, );
    }
    /**
     * Closes the script. If message is equal to null, script will exit without logging.
     * 
     * @param message
     * @param code default code is success.
     */
    private exitProcess( code: string, message?: string ) {
        if ( code = 'success' ) {
            if ( message ) process.stdout.write('Success: ' + message);
            process.exit(0);
        } else if ( code = 'fail' ) {
            if ( message ) process.stderr.write('Error: ' + message);
            process.exit(0);
        } else {
            process.stderr.write('UNHANDLED CODE!');
            process.exit(0);
        }
    }

}