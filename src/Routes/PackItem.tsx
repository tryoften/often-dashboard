import * as React from 'react';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import * as _ from 'underscore';
import { Categories, Category, IndexableObject, Image, Pack, PackAttributes, IndexablePackItem } from '@often/often-core';
import { Grid, Row, Col, Thumbnail, Glyphicon, ButtonGroup, Button } from 'react-bootstrap';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import ConfirmationButton from '../Components/ConfirmationButton';
import MediaItemView from '../Components/MediaItemView';
import ImageSelectionModal from '../Components/ImageSelectionModal';
import EditMediaItemModal from '../Components/EditMediaItemModal';
import PaginationControl from '../Components/PaginationControl';

const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const rootURL = 'https://often-prod.firebaseio.com';

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	prodPack?: Pack;
	shouldShowSearchPanel?: boolean;
	shouldShowImageSelectionPanel?: boolean;
	shouldShowEditMediaItemModal?: boolean;
	isNew?: boolean;
	form?: PackAttributes;
	categories?: Categories;
	loading?: boolean;
	loadingProdPack?: boolean;
	selectedItem?: IndexableObject;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {

	constructor(props: PackItemProps) {
		super(props);

		let isNew = !props.params.packId;

		this.state = {
			shouldShowSearchPanel: false,
			shouldShowEditMediaItemModal: false,
			loading: true,
			loadingProdPack: true,
			isNew: isNew
		};

		this.updateStateWithPack = this.updateStateWithPack.bind(this);
		this.updateStateWithProdPack = this.updateStateWithProdPack.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.onClickAddItem = this.onClickAddItem.bind(this);
		this.togglePublish = this.togglePublish.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onUpdatePackItems = this.onUpdatePackItems.bind(this);
		this.updateStateWithCategories = this.updateStateWithCategories.bind(this);
		this.onClickRemoveItem = this.onClickRemoveItem.bind(this);
		this.getResizedImage = this.getResizedImage.bind(this);
		this.onClickSelectImage = this.onClickSelectImage.bind(this);
		this.onSetItemCategory = this.onSetItemCategory.bind(this);
		this.onSetItemPosition = this.onSetItemPosition.bind(this);
		this.onCloseEditMediaItemModal = this.onCloseEditMediaItemModal.bind(this);
		this.onCloseImageSelectionModal = this.onCloseImageSelectionModal.bind(this);
		this.onClickUpdateProd = this.onClickUpdateProd.bind(this);
	}

	componentDidMount() {
		let pack = this.state.isNew ? new Pack() : new Pack({
			id: this.props.params.packId
		});

		let prodPack = new Pack({
			id: pack.id
		}, {
			autoSync: false,
			setObjectMap: true,
			rootURL: rootURL
		});

		let categories = new Categories();

		let state = {
			model: pack,
			prodPack: prodPack,
			form: pack.toJSON(),
			categories: categories
		};

		pack.on('update', this.updateStateWithPack);
		prodPack.on('update', this.updateStateWithProdPack);
		categories.on('update', this.updateStateWithCategories);

		this.setState(state);

		pack.syncData().then(() => {
			this.updateStateWithPack(pack);
		});

		prodPack.syncData().then(() => {
			this.updateStateWithProdPack(prodPack);
		});

		categories.fetch({
			success: this.updateStateWithCategories
		});
	}

	componentWillUnmount() {
		this.state.model.off('update', this.updateStateWithPack);
		this.state.prodPack.off('update', this.updateStateWithProdPack);
		this.state.categories.off('update', this.updateStateWithCategories);
	}

	updateStateWithPack(pack: Pack) {
		this.setState({
			model: pack,
			form: pack.toJSON(),
			loading: false
		});
	}

	updateStateWithProdPack(pack: Pack) {
		this.setState({
			prodPack: pack,
			loadingProdPack: false
		})
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
			shouldShowSearchPanel: true
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
			shouldShowSearchPanel: false
		});
	}

	handlePropChange(e: any) {
		let target = e.target;
		let id = target.id;
		let form = this.state.form;
		let value = target.value;

		switch (target.type) {
			case 'number':
				value = parseFloat(value);
				break;
			case 'checkbox':
				value = target.checked;
				break;
			default:
				break;
		}

		objectPath.set(form, id, value);
		this.setState({form});
	}

	handleUpdate(e) {
		e.preventDefault();

		let model = this.state.model;
		let form = this.state.form;

		var diff = model.featured !== form.featured;
		model.save(this.state.form);
		/* Check if there's a discrepancy between featured flag on model and form */
		if (diff) {
			model.updateFeatured();
		}
		this.setState({model: model, isNew: false, form: model.toJSON()});

	}

	togglePublish(e) {
		let form = this.state.form;
		form.published = !form.published;
		form.publishedTime = new Date().toISOString();
		this.setState({form});
		this.handleUpdate(e);
	}

	onDelete(e) {
		this.state.model.save({
			deleted: true
		});
		//this.context.router.push('/packs');
	}

	getResizedImage(image: Image) {
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
		let prodPack = this.state.prodPack;
		prodPack.save(pack.toJSON());
	}

	render() {
		if (this.state.loading) {
			return <div>Loading...</div>;
		}

		let classes = classNames("section pack-item", {hidden: this.state.loading});
		let form = this.state.form;

		let items = this.state.model.items.map( (item, index) => {
			return (
				<div key={item._id} id={item._id} className="clearfix well pack-item" onClick={this.onClickEditMediaItem.bind(this, item)}>
					<div className="index-display">{index + 1}</div>
					<MediaItemView
						key={item._id}
						item={item}
					/>
				</div>
			);
		});
		let disableUpload = this.state.loading || this.state.loadingProdPack; //If both packs have loaded then 'name' attributes should be present on both of them
		let copyToProdButton = (
			<ConfirmationButton
				onConfirmation={this.onClickUpdateProd}
				confirmationText="Are you sure you want to upload this pack to production?"
				disabled={disableUpload}
				bsStyle="default"
			>
				<Glyphicon glyph="upload"/>Update To Prod
			</ConfirmationButton>);

		return (
			<div className={classes}>
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={12} md={8}>
							<Row>
								<Col xs={12} md={8}>
									<FormGroup>
										<ControlLabel>Name</ControlLabel>
										<FormControl
											id="name"
											type="text"
											placeholder="Enter Name"
											value={form.name}
											onChange={this.handlePropChange}/>
									</FormGroup>
									<FormGroup>
										<ControlLabel>Description</ControlLabel>
										<FormControl
											id="description"
											type="text"
											placeholder="Description"
											value={form.description}
											onChange={this.handlePropChange}/>
									</FormGroup>
								</Col>
							</Row>
							<Row>
								<Col xs={2} md={2}>
									<FormGroup>
										<ControlLabel>Premium</ControlLabel>
										<FormControl
											id="premium"
											type="checkbox"
											checked={form.premium}
											onChange={this.handlePropChange }/>
									</FormGroup>
								</Col>
								<Col xs={2} md={2}>
									<FormGroup>
										<ControlLabel>Featured</ControlLabel>
										<FormControl
											id="featured"
											type="checkbox"
											checked={form.featured}
											onChange={this.handlePropChange }/>
									</FormGroup>
								</Col>
							</Row>
							<Row>
								<Col md={4}>
									<div class="image-upload pack-thumbnail">
										<Thumbnail src={form.image.small_url} onClick={this.onClickSelectImage} />
									</div>
								</Col>
							</Row>
							<Row>
								<Col xs={4}>
									<ButtonGroup>
										<Button onClick={this.handleUpdate}>{this.state.isNew ? 'Create' : 'Save'}</Button>
										<Button {...form.published ? {bsStyle: 'primary'} :  {}} onClick={this.togglePublish}>{ form.published ? 'Unpublish' : 'Publish'}</Button>
									</ButtonGroup>
								</Col>
								<Col xs={2}>
									<div className="pull-right">
										<Button onClick={this.onClickAddItem}><Glyphicon glyph="plus-sign" />Add Item</Button>
									</div>
								</Col>
								<Col xs={2}>
									<div className="pull-right">
										{copyToProdButton}
									</div>
								</Col>
								<Col xs={4}>
									<div className="pull-right">
										<ConfirmationButton onConfirmation={this.onDelete} bsStyle="danger"> Delete </ConfirmationButton>
									</div>
								</Col>
							</Row>
							<Row>
								<div className="media-item-group">
									<h3>Items</h3>
									<div className="items">
										<PaginationControl items={items} />
									</div>
								</div>
							</Row>
						</Col>
						<Col xs={6}>
							{(this.state.shouldShowSearchPanel) ? <AddItemToPackModal show={this.state.shouldShowSearchPanel} packItems={this.state.model.get('items')} onUpdatePackItems={this.onUpdatePackItems} /> : ''}
						</Col>
						<Col xs={6}>
							<ImageSelectionModal
								show={this.state.shouldShowImageSelectionPanel}
								getResizedImage={this.getResizedImage}
								onCloseImageSelectionModal={this.onCloseImageSelectionModal}
							/>
						</Col>
						<Col xs={6}>
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
							/>
						</Col>
					</Row>
				</Grid>

			</div>
		);
	}
}



