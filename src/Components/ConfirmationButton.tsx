import * as React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

interface ConfirmationButtonProps extends ButtonProps {
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
			<Button {...this.props}
				bsStyle={this.props.bsStyle || "default"}
				onClick={this.onClick.bind(this)}
				>
				{this.props.children}
			</Button>
		);
	}
}
