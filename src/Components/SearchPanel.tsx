import * as React from 'react';
import { Modal } from 'react-bootstrap';
import SearchBar, { SearchBarState } from './SearchBar';
import { firebase as FirebaseConfig } from '../../config';
import SearchResultsTable from './SearchResultsTable';
import * as Firebase from 'firebase';
import * as classNames from 'classnames';

interface SearchPanelProps extends React.Props<SearchPanel> {
	presentInModal?: boolean;
	show?: boolean;
}

interface SearchPanelState {
	showModal?: boolean;
}

export default class SearchPanel extends React.Component<SearchPanelProps, SearchPanelState> {
	searchQueue: Firebase;

	constructor(props: SearchPanelProps) {
		super(props);

		this.searchQueue = new Firebase(`${FirebaseConfig.BaseURL}/queues/search/tasks`);
	}

	onSearchBarChange(state: SearchBarState) {
		if (!state.query) {
			return;
		}

		var id = new Buffer(state.query.trim()).toString('base64');

	}

	componentWillReceiveProps(nextProps: SearchPanelProps) {
		this.setState({
			showModal: nextProps.show
		});
	}

	close() {
		this.setState({showModal: false});
	}

	render() {
		let classes = classNames("search-panel", {
			hidden: this.props.presentInModal && !this.props.show
		});

		let content = (
			<div className={classes}>
				<SearchBar onChange={this.onSearchBarChange.bind(this)} />
			</div>
		);

		return this.props.presentInModal ? (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Header closeButton>
					<Modal.Title>Search</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{content}
				</Modal.Body>
			</Modal>
		) : content;
	}
}
