import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import * as _ from 'underscore';
import Categories from '../../Collections/Categories';
import { Grid, Row, Col, Thumbnail, Glyphicon, ButtonGroup, Button } from 'react-bootstrap';
import Pack, { PackAttributes, IndexablePackItem } from '../../Models/Pack';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import DeleteButton from '../Components/DeleteButton';
import Category from '../../Models/Category';
import MediaItemView from '../Components/MediaItemView';
import ImageSelectionModal from '../Components/ImageSelectionModal';
import EditMediaItemModal from '../Components/EditMediaItemModal';
import Image from '../../Models/Image';
import PaginationControl from '../Components/PaginationControl';
import {IndexableObject} from '../../Interfaces/Indexable';
const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	shouldShowSearchPanel?: boolean;
	shouldShowImageSelectionPanel?: boolean;
	shouldShowEditMediaItemModal?: boolean;
	display?: boolean;
	isNew?: boolean;
	form?: PackAttributes;
	categories?: Categories;
	loading?: boolean;
	selectedItem?: IndexableObject;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {
	static contextTypes: React.ValidationMap<any> = {
		router: React.PropTypes.object
	};

	context: {
		router: ReactRouter.RouterOnContext;
	};

	constructor(props: PackItemProps) {
		super(props);

		let isNew = !props.params.packId;

		this.state = {
			shouldShowSearchPanel: false,
			shouldShowEditMediaItemModal: false,
			display: false,
			isNew: isNew
		};

		this.updateStateWithPack = this.updateStateWithPack.bind(this);
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

		pack.fetch({
			success: this.updateStateWithPack
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
			display: true
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
		this.context.router.push('/packs');
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

	render() {
		if (!this.state.display) {
			return <div>Loading...</div>;
		}

		let classes = classNames("section pack-item", {hidden: !this.state.display});
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
								<Col xs={4}>
									<div className="pull-right">
										<DeleteButton onConfirmation={this.onDelete} />
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



