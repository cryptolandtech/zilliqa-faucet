import { h, Component } from 'preact';

import Card from 'preact-material-components/Card';
import Button from 'preact-material-components/Button';
import LinearProgress from 'preact-material-components/LinearProgress';
import TextField from 'preact-material-components/TextField';

import ReCaptcha from 'preact-google-recaptcha';

export default class App extends Component {
	constructor() {
		super(arguments);

		this.reCaptcha = null;

		this.state = {
			loading: false,
			address: undefined,
			txId: undefined
		}
	}

	sendZil() {
		fetch("/api/faucet/requestTokens", {
			method: "post",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				address: this.state.address,
				token: this.reCaptcha.getResponse()
			})
		}).then(async (res) => {
			const data = await res.json();
			if (!data.error) {
				this.setState({
					loading: false, 
					txId: data.data.txnId
				})
				console.log("success", data);
				alert("ZILs were sent to your wallet. Have fun!");
			} else {
				alert(data.error);
				this.setState({
					loading: false, 
					txId: undefined
				});
			}

		}).catch((err) => {
			console.log("error", err);
			this.setState({
				loading: false, 
				txId: undefined
			});
			alert("Something went wrong. We could't send you ZILs :( Try again later.");
		}).finally(() => {
			this.reCaptcha.reset();
		});
	}

	onGet10ZilClick() {
		console.log("get me zils");
		this.setState({loading: true});
		this.reCaptcha.execute();
	}

	onAddressChange(e) {
		let address = e.srcElement.value.trim();

		if (address.length > 40) {
			address = address.replace(/^0x/i, "");
		}

		this.setState({address});
	}

	onReCaptchaChange(response) {
		this.sendZil();
	}

	render() {
		return (
			<div id="app">
				<div style="max-width: 500px; margin: 30px auto;">
					<Card>
						<img src="assets/zil.svg" style="height: 180px; margin-top: 30px;"/>
						<p>Network: Testnetv3</p>
						<TextField label="Wallet address" showFloatingLabel outerStyle="margin-left: 2em; margin-right: 2em;" onChange={(e) => this.onAddressChange(e)}/>
						
						{ this.state.txId && <p style="margin: 0 2em;">
							<div><TextField label="Transaction ID" showFloatingLabel value={this.state.txId} outerStyle="display: flex;"/></div>
							<Button className="mdc-button--raised" secondary href={"https://explorer.zilliqa.com/transactions/" + this.state.txId} target="_blank">View in Explorer</Button>
						</p> }

						<ReCaptcha 
							ref={(el) => this.reCaptcha = el} 
							size="invisible" 
							sitekey="6LdhhmcUAAAAAOCOxjSBt8dHyijAanKNTuV3pEKX" 
							onChange={(res) => this.onReCaptchaChange(res)}
						></ReCaptcha>
						
						<Button className="mdc-button--raised" style="margin: 2em;" onClick={() => this.onGet10ZilClick()} disabled={this.state.loading}>Get 10 ZIL</Button>

						{this.state.loading && <LinearProgress className="mdc-linear-progress--indeterminate"></LinearProgress>}
					</Card>
				</div>
			</div>
		);
	}
}

