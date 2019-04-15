# myJams

This is a website that uses spotify's web api to show a user lists of their top tracks from various time periods, and lets you make playlists out of them to jam out to.

## Installation

This project runs on Node.js. On [its website](http://www.nodejs.org/download/) you can find instructions on how to install it. You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm.

Once installed, clone the repository and install its dependencies running:

    $ npm install

### Using your own credentials
You will need to register your app and get your own credentials from the Spotify for Developers Dashboard.

To do so, go to [your Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) and create your application. For the examples, we registered these Redirect URIs:

* http://localhost:3000 (needed for the implicit grant flow)
* http://localhost:3000/homepage

Once you have created your app, replace the `client_id`, `redirect_uri` and `client_secret` in the examples with the ones you get from My Applications. Make sure to hid those variables!

## Running the server
In order to run the program, open the folder with the project in it, and run its `app.js` file:

    $ cd myJams
    $ node app.js

Then, open `http://localhost:3000` in a browser.
