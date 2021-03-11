let LOADER_GLOBALS = {
	THEME: "app",
	LABELS_DICTIONARY: {
		APP_NAME: "DSU Explorer",
		APP_DESCRIPTION: "A smart application to keep your secrets",
		NEW_WALLET: "New Wallet",
		ACCESS_WALLET: "Access Wallet",
		WALLET_AUTHORIZATION: "Wallet Authorization",
		REGISTER_DETAILS: "Register details",
		COMPLETE: "Complete",

		SET_UP_USERNAME: "Enter your username",
		SET_UP_USERNAME_HELP: "Username should have at least 6 characters",
		ENTER_USERNAME: "Username",

		SET_UP_EMAIL: "Enter your email",
		SET_UP_EMAIL_HELP: "Enter a valid email address",
		ENTER_EMAIL: "Email",

		SET_UP_COMPANY: "Enter your company name",
		SET_UP_COMPANY_HELP: "Company name is optional",
		ENTER_COMPANY: "Company Name",

		SET_UP_PASSWORD: "Enter your password",
		SET_UP_PASSWORD_HELP: "Password should have at least 4 characters",
		ENTER_PASSWORD: "Password",

		SET_UP_CONFIRM_PASSWORD: "Confirm your password",
		SET_UP_CONFIRM_PASSWORD_HELP: "Passwords should be identical",
		ENTER_CONFIRM_PASSWORD: "Confirm password",

		BACK_BUTTON_MESSAGE: "Back",
		REGISTER_BUTTON_MESSAGE: "Register",
		REGISTER_SUCCESSFULLY: "Register successfully",

		ENTER_CREDENTIALS: "Enter your credentials",
		OPEN_WALLET: "Open Wallet",
		SEED: "Seed",
		ENTER_WALLET_SEED: "Enter Wallet Seed",
		SEED_PRINT: "You can print it on a piece of paper.",
		RESTORE: "Restore",
		WALLET_RESTORED_SUCCESSFULLY: "Your wallet has been successfully restored.",
		CHANGE_WALLET: "Change wallet"
	},
	APP_PATHS: {
		LANDING_PAGE: "/",
		NEW_WALLET: "/new",
		RESTORE_WALLET: "/restore"
	},
	NEW_OR_RESTORE_CONTAINER_ID: "restore-new-container",
	PASSWORD_CONTAINER_ID: "credentials-container",
	MODE: 'secure',
	PASSWORD_MIN_LENGTH: 4,
	USERNAME_MIN_LENGTH: 6,
	USERNAME_REGEX: /^[a-zA-Z]([A-Za-z0-9]+[\\._]{0,1}[A-Za-z0-9]+){2,10}$/,
	EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
	NEW_WALLET_MORE_INFORMATION: `<div class="jumbotron p-0 m-0" align="center">
  <h1 class="display-6">Welcome to your secure wallet!</h1>
  <p class="lead">After completing the following wizard you will gain access to your private data.</p>
  <p class="m-0">In order to access your private data you have to set up your credentials.</p>
  <hr/>
</div>`
};

export default LOADER_GLOBALS;
