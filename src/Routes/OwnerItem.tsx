import * as React from 'react';
import * as _ from 'underscore';
import * as objectPath from 'object-path';
import { browserHistory } from 'react-router';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput, Button, Tabs, Tab } from 'react-bootstrap';
import { Owner, OwnerAttributes, IndexableObject, Image } from '@often/often-core';
import QuoteForm from '../Components/QuoteForm';
import GIFForm from '../Components/GIFForm';
import MediaItemView from '../Components/MediaItemView';
import ConfirmationButton from '../Components/ConfirmationButton';
import ImageSelectionModal from '../Components/ImageSelectionModal';

interface OwnerItemProps extends React.Props<OwnerItem> {
	params: {
		ownerId: string;
	};
}

interface OwnerItemState extends React.Props<OwnerItem> {
	isNew?: boolean;
	model?: Owner;
	loading?: boolean;
	shouldShowQuoteForm?: boolean;
	shouldShowGIFForm?: boolean;
	shouldShowImageForm?: boolean;
	currentQuoteId?: string;
	currentGIFId?: string;
	form?: OwnerAttributes;
}

export default class OwnerItem extends React.Component<OwnerItemProps, OwnerItemState> {
	constructor(props: OwnerItemProps) {
		super(props);

		let isNew = !props.params.ownerId;

		this.state = {
			isNew: isNew,
			loading: true,
			shouldShowQuoteForm: false,
			shouldShowGIFForm: false,
			shouldShowImageForm: false
		};

		this.updateOwnerState = this.updateOwnerState.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.onClickQuote = this.onClickQuote.bind(this);
		this.onClickDelete = this.onClickDelete.bind(this);

	}

	componentDidMount() {
		let owner = this.state.isNew ? new Owner(): new Owner({
			id: this.props.params.ownerId
		});

		owner.on('update', this.updateOwnerState);
		owner.fetch({
			success: this.updateOwnerState.bind(this)
		});
	}

	componentWillUnmount() {
		this.state.model.off('update')
	}

	updateOwnerState(owner: Owner) {
		this.setState({
			loading: false,
			model: owner,
			form: owner.toJSON()
		});
	}

	handlePropChange(e: any) {
		let id = e.target.id;
		let form = this.state.form;
		objectPath.set(form, id, e.target.value);
		this.setState({form});
	}

	handleUpdate(e) {
		e.preventDefault();

		let model = this.state.model;
		let form = _.extend({}, this.state.model.toJSON(), this.state.form);
		model.save(form);
		this.setState({model: model, isNew: false, form});
	}


	onClickQuote(item: IndexableObject) {
		this.setState({
			currentQuoteId: item._id,
			shouldShowQuoteForm: true
		});
	}

	onClickAddQuote(e: Event) {
		e.preventDefault();
		this.setState({shouldShowQuoteForm: true});
	}

	onClickAddGIF(e: Event) {
		e.preventDefault();
		this.setState({shouldShowGIFForm: true});
	}

	onClickAddImage(e: Event) {
		e.preventDefault();
		this.setState({shouldShowImageForm: true});
	}

	addImage(img: Image) {
		let owner = this.state.model;
		let imgProps = _.extend({ _type: "image"}, img.toJSON());
		owner.addImage(imgProps);
		owner.save();
		this.setState({
			shouldShowImageForm: false,
			model: owner
		});
	}

	close() {
		this.setState({shouldShowQuoteForm: false, shouldShowGIFForm: false, shouldShowImageForm: false});
	}

	onClickDelete(e) {
		this.state.model.destroy();
		browserHistory.push('/owners');
	}

	render() {
		if(this.state.loading) {
			return <div>Loading...</div>
		}

		let deleteButton = !this.state.isNew ?
			<ConfirmationButton
				bsStyle="danger"
				onConfirmation={this.onClickDelete}
				confirmationText="Are you sure you want to delete this owner?"
			>
				Delete
			</ConfirmationButton>
			: '';

		var itemsComponents = Object.keys(this.state.model.quotes || []).map(key => {
			let item = this.state.model.quotes[key];
			return <MediaItemView key={key} item={item} onSelect={this.onClickQuote.bind(this)} />;
		});

		var gifs = Object.keys(this.state.model.gifs || []).map(key => {
			let item = this.state.model.gifs[key];
			return <MediaItemView key={key} item={item} />;
		});

		var images = Object.keys(this.state.model.images || []).map(key => {
			let item = this.state.model.images[key];
			return <MediaItemView key={key} item={item} />;
		});

		var quoteForm = this.state.shouldShowQuoteForm ?
			(<QuoteForm owner={this.state.model}
				quoteId={this.state.currentQuoteId}
				show={this.state.shouldShowQuoteForm}
				onSaveChanges={this.close.bind(this)}/>) : "";

		var gifForm = this.state.shouldShowGIFForm ?
			(<GIFForm owner={this.state.model}
				gifId={this.state.currentGIFId}
				show={this.state.shouldShowGIFForm}
				onSaveChanges={this.close.bind(this)}/>) : "";

		var imageForm = this.state.shouldShowImageForm ?
			(<ImageSelectionModal
				show={this.state.shouldShowImageForm}
				getResizedImage={this.addImage.bind(this)}
			/>) : "";

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.form.name}</h2>
				</header>

				{quoteForm}
				{gifForm}
				{imageForm}

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form className="updateForm" onSubmit={this.handleUpdate}>
								<Row>
									<Col xs={8}>
										<Input
											id="name"
											type="text"
											label="Name"
											bsSize="medium"
											value={this.state.form.name}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={4}>
										<div className="image-upload">
											<Thumbnail src={this.state.form.image.small_url} />
										</div>
									</Col>
									<Col xs={8}>
										<Input
											id="image.small_url"
											type="text"
											label="Small Image"
											bsSize="medium"
											value={this.state.form.image.small_url}
											onChange={this.handlePropChange}
										/>
										<Input
											id="image.large_url"
											type="text"
											label="Large Image"
											bsSize="medium"
											value={this.state.form.image.large_url}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={8}>
										<ButtonInput type="submit" value={this.state.isNew ? 'Create' : 'Save'} />
									</Col>
									<Col xs={4}>
										{deleteButton}
									</Col>
								</Row>
								<Row>
									<div className="media-item-group">
										<div className="items clearfix">
											<Tabs defaultActiveKey={0}>
												<Tab eventKey={0} title="GIFs">
													<Button onClick={this.onClickAddGIF.bind(this)}>Add GIF</Button>
													<div className="tab-body clearfix">{gifs}</div>
												</Tab>
												<Tab eventKey={1} title="Quotes">
													<Button onClick={this.onClickAddQuote.bind(this)}>Add Quote</Button>
													<div className="tab-body clearfix">{itemsComponents}</div>
												</Tab>
												<Tab eventKey={2} title="Images">
													<Button onClick={this.onClickAddImage.bind(this)}>Add Image</Button>
													<div className="tab-body clearfix">{images}</div>
												</Tab>
											</Tabs>
										</div>
									</div>
								</Row>
							</form>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
