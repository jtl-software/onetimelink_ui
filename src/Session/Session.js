export default class Session {

    constructor(storageKey) {

        this.storageKey = storageKey;
        this.hasSession = false;

        this.sessionData = this.read();
    }

    isActive() {

        // if (typeof apiUrl === 'string') {
        // todo check for active server side session
        // }
        return this.hasSession;
    }

    getUser() {
        return this.sessionData.user === null
            ? 'anonymous' : this.sessionData.user;
    }

    getToken() {
        return this.sessionData.token;
    }

    getSession() {
        return this.sessionData.session;
    }

    setSession(token, session, user) {

        this.sessionData = {
            token: token,
            session: session,
            user: user,
            _: (new Date()).toISOString(),
        };

        return this;
    }

    read() {
        let _ = JSON.parse(localStorage.getItem(this.storageKey));
        if (_ !== null) {
            this.hasSession = true;
            return _;
        }

        return {
            token: null,
            session: null,
            user: null,
            _: (new Date()).toISOString(),
        };

    }

    persist() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.sessionData));
        this.hasSession = true;
    }

    clear() {
        localStorage.removeItem(this.storageKey);
        this.hasSession = false;
    }
}
