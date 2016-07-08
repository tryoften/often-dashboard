import * as React from 'react';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import * as _ from 'underscore';
import { Categories, Category, IndexableObject, Image, Pack, PackAttributes, IndexablePackItem } from '@often/often-core';
import { Grid, Row, Col, Thumbnail, Glyphicon, ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { firebase as FirebaseConfig } from '../config';
import { production as prodApp } from '../db';

import AddItemToPackModal from '../Components/AddItemToPackModal';
import ConfirmationButton from '../Components/ConfirmationButton';
import MediaItemView from '../Components/MediaItemView';
import ImageSelectionModal from '../Components/ImageSelectionModal';
import EditMediaItemModal from '../Components/EditMediaItemModal';
import PaginationControl from '../Components/PaginationControl';
import PackEditModal from '../Components/PackEditModal';

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	shouldShowAddItemModal?: boolean;
	shouldShowImageSelectionPanel?: boolean;
	shouldShowEditMediaItemModal?: boolean;
	shouldShowEditPackModal?: boolean;
	isNew?: boolean;
	form?: PackAttributes;
	categories?: Categories;
	loading?: boolean;
	selectedItem?: IndexableObject;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {

	constructor(props: PackItemProps) {
		super(props);

		let isNew = !props.params.packId;

		this.state = {
			shouldShowAddItemModal: false,
			shouldShowEditMediaItemModal: false,
			shouldShowImageSelectionPanel: false,
			shouldShowEditPackModal: false,
			loading: true,
			isNew: isNew
		};

		this.updateStateWithPack = this.updateStateWithPack.bind(this);
		this.onClickAddItem = this.onClickAddItem.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onUpdatePackItems = this.onUpdatePackItems.bind(this);
		this.updateStateWithCategories = this.updateStateWithCategories.bind(this);
		this.onClickRemoveItem = this.onClickRemoveItem.bind(this);
		this.onImageSelected = this.onImageSelected.bind(this);
		this.onClickSelectImage = this.onClickSelectImage.bind(this);
		this.onSetItemCategory = this.onSetItemCategory.bind(this);
		this.onSetItemPosition = this.onSetItemPosition.bind(this);
		this.onCloseEditMediaItemModal = this.onCloseEditMediaItemModal.bind(this);
		this.onCloseImageSelectionModal = this.onCloseImageSelectionModal.bind(this);
		this.onClosePackEditModal = this.onClosePackEditModal.bind(this);
		this.onClickUpdateProd = this.onClickUpdateProd.bind(this);
		this.onClickEdit = this.onClickEdit.bind(this);
		this.onSavePackEditModal = this.onSavePackEditModal.bind(this);
	}

	componentDidMount() {
		let pack = this.state.isNew ? new Pack() : new Pack({
			id: this.props.params.packId
		});

		let categories = new Categories();

		let state = {
			model: pack,
			form: pack.toJSON(),
			categories: categories
		};

		pack.on('update', this.updateStateWithPack);
		categories.on('update', this.updateStateWithCategories);

		this.setState(state);

		pack.syncData().then(() => {
			this.updateStateWithPack(pack);
		});

		categories.fetch({
			success: this.updateStateWithCategories
		});
	}

	componentWillUnmount() {
		this.state.model.off('update', this.updateStateWithPack);
		this.state.categories.off('update', this.updateStateWithCategories);
	}

	updateStateWithPack(pack: Pack) {
		this.setState({
			model: pack,
			form: pack.toJSON(),
			loading: false
		});
	}

	updateStateWithCategories(categories: Categories) {
		this.setState({categories});
	}

	onSetItemCategory(itemId: string, category: Category) {
		let model = this.state.model;
		model.assignCategoryToItem(itemId, category);
		this.setState({
			model: model
		});
	}

	onSetItemPosition(itemId: string, newPosition: number) {
		let model = this.state.model;
		model.setItemPosition(itemId, newPosition);

		this.setState({
			model: model
		});
	}

	onClickEdit(e) {
		this.setState({
			shouldShowEditPackModal: true,
			shouldShowEditMediaItemModal: false,
			shouldShowImageSelectionPanel: false,
			shouldShowAddItemModal: false
		});
	}

	onClickRemoveItem(item: IndexablePackItem) {
		console.log(item);

		let model = this.state.model;
		model.removeItem(item);

		this.setState({
			shouldShowEditMediaItemModal: false,
			model: model
		});
	}

	onClickAddItem(e: Event) {
		e.preventDefault();

		this.setState({
			shouldShowAddItemModal: true
		});
	}

	onClickSelectImage(e: Event) {
		e.preventDefault();

		this.setState({
			shouldShowImageSelectionPanel: true
		});
	}

	onUpdatePackItems(packItems: IndexablePackItem[]) {
		let model = this.state.model;
		model.save({
			items: packItems
		});

		this.setState({
			model: model,
			form: model.toJSON(),
			shouldShowAddItemModal: false
		});
	}


	onDelete(e) {
		this.state.model.save({
			deleted: true
		});
	}

	onImageSelected(image: Image) {
		let form = this.state.form;
		form.imageId = image.id;

		form.image = {
			square_small_url: image.square_small_url,
			square_url: image.square_url,
			small_url: image.square_medium_url,
			medium_url: image.medium_url,
			original_url: image.original_url,
			large_url: image.large_url
		};

		this.setState({
			form: form,
			shouldShowImageSelectionPanel: false
		});

		this.state.model.save(form);
	}

	onCloseEditMediaItemModal() {
		this.setState({
			shouldShowEditMediaItemModal: false
		});
	}

	onCloseImageSelectionModal() {
		this.setState({
			shouldShowImageSelectionPanel: false
		});
	}

	onClosePackEditModal() {
		this.setState({
			shouldShowEditPackModal: false
		})
	}

	onSavePackEditModal() {
		let model = this.state.model;

		this.setState({
			model: model,
			form: model.toJSON(),
			shouldShowEditPackModal: false
		});
	}

	onClickEditMediaItem(item: IndexablePackItem) {
		this.setState({
			selectedItem: item,
			shouldShowEditMediaItemModal: true
		});
	}

	getSelectedItemPosition() {
		if (this.state.selectedItem) {
			return _.findIndex(this.state.model.items, (itm) => itm.id === this.state.selectedItem.id);
		}
		return -1;
	}

	onClickUpdateProd() {
		let pack = this.state.model;

		let prodPack = new Pack({
			id: pack.id
		}, {
			autoSync: false,
			setObjectMap: true,
			rootRef: prodApp.database()
		});

		prodPack.syncData().then(() => {
			prodPack.save(pack.toJSON());
		});
	}

	render() {
		if (this.state.loading) {
			return <div>Loading...</div>;
		}

		let classes = classNames("section pack-item", {hidden: this.state.loading});
		let form = this.state.form;

		let items = this.state.model.items.map( (item, index) => {
			return (
				<div key={item._id}
					 id={item._id}
					 className="clearfix well pack-item"
					 onClick={this.onClickEditMediaItem.bind(this, item)}>
						<div className="index-display">{index + 1}</div>
						<MediaItemView
							key={item._id}
							item={item}
						/>
				</div>
			);
		});

		return (
			<div className={classes}>
				<header className="section-header">
					<Link to="/packs">
						<h2><Glyphicon glyph="menu-left" /> Packs</h2>
					</Link>

					<ButtonToolbar className="pull-right">
						<ButtonGroup>
							<Button onClick={this.onClickAddItem}><Glyphicon glyph="plus-sign" /> Add Item</Button>
							<ConfirmationButton
								onConfirmation={this.onClickUpdateProd}
								confirmationText="Are you sure you want to publish/update this pack?"
								bsStyle="default">
								<Glyphicon glyph="upload"/> Publish
							</ConfirmationButton>
						</ButtonGroup>

						<Button onClick={this.onClickEdit}>Edit</Button>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col className="pack-info">
							<div className="image-upload pack-thumbnail">
								<Thumbnail src={form.image.small_url} onClick={this.onClickSelectImage} />
							</div>
							<div className="meta">
								<div className="name">{form.name}</div>
								<div className="description">{form.description}</div>
							</div>

							<div className="media-item-group">
								<h3>Items</h3>
								<div className="items">
									<PaginationControl items={items} />
								</div>
							</div>
						</Col>
					</Row>
				</Grid>

				{ this.state.shouldShowAddItemModal ?
					<AddItemToPackModal
						show={this.state.shouldShowAddItemModal}
						packItems={this.state.model.get('items')}
						onUpdatePackItems={this.onUpdatePackItems}
					/> : '' }

				{ this.state.shouldShowImageSelectionPanel ?
					<ImageSelectionModal
						show={this.state.shouldShowImageSelectionPanel}
						getResizedImage={this.onImageSelected}
						onCloseImageSelectionModal={this.onCloseImageSelectionModal}
					/> : '' }

				{ this.state.shouldShowEditMediaItemModal ?
					<EditMediaItemModal
						show={this.state.shouldShowEditMediaItemModal}
						item={this.state.selectedItem}
						selectedItemPosition={this.getSelectedItemPosition()}
						numItems={this.state.model.items.length}
						removeItemFromPack={this.onClickRemoveItem}
						categories={this.state.categories}
						onSetItemCategory={this.onSetItemCategory}
						onSetItemPosition={this.onSetItemPosition}
						onCloseMediaItemModal={this.onCloseEditMediaItemModal}
					/> : '' }

				{ this.state.shouldShowEditPackModal ?
					<PackEditModal
						show={this.state.shouldShowEditPackModal}
						pack={this.state.model}
						onClose={this.onClosePackEditModal}
						onSave={this.onSavePackEditModal}
					/> : '' }

			</div>
		);
	}
}



