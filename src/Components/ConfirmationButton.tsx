import * as React from 'react';
import { Button } from 'react-bootstrap';

interface ConfirmationButtonProps extends React.Props<ConfirmationButton> {
	showConfirmMessage?: boolean;
	confirmationText?: string;
	onConfirmation?: (boolean) => void;
	disabled?: boolean;
	bsStyle?: string;
}

export default class ConfirmationButton extends React.Component<ConfirmationButtonProps, {}> {
	onClick(e) {
		if ( confirm(this.props.confirmationText || "Are you sure you want to submit this form?") ) {
			this.props.onConfirmation(true);
		}
	}

	render() {
		return (
			<Button {...this.props} bsStyle={this.props.bsStyle || "default"} onClick={this.onClick.bind(this)} disabled={this.props.disabled}>{this.props.children}</Button>
		);
	}
}
