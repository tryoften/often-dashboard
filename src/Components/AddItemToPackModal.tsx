import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Tabs, Tab, ButtonGroup, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import { Owners, Owner, MediaItemType } from '@often/often-core';
import MediaItemView from '../Components/MediaItemView';
import { IndexablePackItem } from '@often/often-core/src/often-core/Models/Pack';

const shallowCompare = require('react-addons-shallow-compare');

interface AddItemToPackModalProps extends React.Props<AddItemToPackModal> {
	show: boolean;
	packItems?: IndexablePackItem[];
	onUpdatePackItems?: (selectedItems: IndexablePackItem[]) => void;
}

interface AddItemToPackModalState {
	showModal?: boolean;
	owners?: Owners;
	selectedOwner?: Owner;
	selectedItems?: IndexablePackItem[];
	loading?: boolean;
}

export default class AddItemToPackModal extends React.Component<AddItemToPackModalProps, AddItemToPackModalState> {
	owners: Owners;

	constructor(props: AddItemToPackModalProps) {
		super(props);

		this.owners = new Owners();

		this.state = {
			selectedItems: props.packItems || [],
			showModal: props.show,
			owners: this.owners,
			loading: true
		};

		this.onSelectOwnerChange = this.onSelectOwnerChange.bind(this);
		this.updateStateWithModel = this.updateStateWithModel.bind(this);
		this.onSaveChanges = this.onSaveChanges.bind(this);
		this.onSelectItem = this.onSelectItem.bind(this);
		this.owners.on('update', this.updateStateWithModel);
	}

	updateStateWithModel(owners: Owners) {
		this.setState({
			owners,
			selectedOwner: owners.models.length ? owners.models[0] : null,
			loading: false
		});
	}

	componentDidMount() {
		this.state.owners.fetch({
			success: this.updateStateWithModel
		});
	}

	componentWillUnmount() {
		this.owners.off('update', this.updateStateWithModel);
	}

	componentWillReceiveProps(nextProps: AddItemToPackModalProps) {
		this.setState({
			selectedItems: nextProps.packItems,
			showModal: nextProps.show
		});
	}

	onSelectOwnerChange(ownerKey: any, e: any) {
		let owner = this.state.owners.get(ownerKey);
		this.setState({selectedOwner: owner});
	}

	onSelectItem(item: IndexablePackItem) {
		let selectedItems: IndexablePackItem[] = this.state.selectedItems;
		let formItemIndex = _.findIndex(selectedItems, (formItem) => {
			return (formItem.id === item.id);
		});
		if (formItemIndex > -1) {
			/* Item already selected, so unselect it from the list */
			selectedItems.splice(formItemIndex, 1);
		} else {
			/* Item not selected, so add it to the list */
			selectedItems.push(item);
		}

		this.setState({
			selectedItems: selectedItems
		});
	}

	onSaveChanges(e) {
		e.preventDefault();
		this.props.onUpdatePackItems(this.state.selectedItems);
		this.setState({showModal: false});
	}

	close() {
		this.setState({showModal: false});
	}

	render() {
		if (this.state.loading) {
			return (
				<Modal className="add-item-modal" show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
					<Modal.Body>
						<div>Loading...</div>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.close.bind(this)}>Close</Button>
					</Modal.Footer>
				</Modal>
			);
		}

		let ownersSelector = this.owners.sortBy('name')
			.filter(model => model.name !== '')
			.map(model => {
				return <MenuItem
					key={model.id}
					onClick={this.onSelectOwnerChange.bind(this, model.id)}
					value={model.id}>{model.get('name')}</MenuItem>;
			});

		let ownerQuotes = this.state.selectedOwner ? Object.keys(this.state.selectedOwner.get('quotes') || []).map(key => {
			let quote = this.state.selectedOwner.get('quotes')[key];
			let foundQuote = _.findWhere(this.state.selectedItems, {
				id: quote.id
			});
			return (<MediaItemView
				key={key}
				item={quote}
				onSelect={this.onSelectItem.bind(this)}
				selected={!!foundQuote} />);

		}) : "";

		let gifs =  this.state.selectedOwner ? Object.keys(this.state.selectedOwner.get('gifs') || []).map(key => {
			let item = this.state.selectedOwner.get('gifs')[key];
			let foundGif = _.findWhere(this.state.selectedItems, {
				id: item.id
			});
			return (<MediaItemView
				key={key}
				item={item}
				onSelect={this.onSelectItem.bind(this)}
				selected={!!foundGif} />);

		}) : "";

		let ownerName = this.state.selectedOwner ? this.state.selectedOwner.get('name') : '';

		return (
			<Modal className="add-item-modal" show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Header>
					<ButtonGroup>
						<DropdownButton
							id="owner-dropdown"
							title={ownerName}
							label="Select Owner">
							{ownersSelector}
						</DropdownButton>
					</ButtonGroup>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid add-items">
						<div className="media-item-group">
							<div className="items">{gifs}</div>
							<div className="items">{ownerQuotes}</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close.bind(this)}>Close</Button>
					<Button onClick={this.onSaveChanges} bsStyle="primary">Save changes</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
