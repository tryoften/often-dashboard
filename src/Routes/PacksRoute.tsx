import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import PackGroup, { PackGroupType } from '../Components/PackGroup';
import { Packs, Pack, Featured, MediaItemType, Sections } from '@often/often-core';
import PackView from '../Components/PackView';
import { production as prodFirebase } from '../db';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ConfirmationButton from '../Components/ConfirmationButton';
import PackEditModal from '../Components/PackEditModal';

const firebase = require('firebase');

interface PacksProps extends React.Props<PacksRoute> {
	open?: boolean;
}

interface PacksState extends React.Props<PacksRoute> {
	packs?: Packs;
	featured?: Featured;
	featuredPacks?: Pack[];
	loadingPacks?: boolean;
	loadingFeatured?: boolean;
	sampleSize?: number;
	sections?: Sections;
	shouldShowNewPackModal?: boolean;
}

export default class PacksRoute extends React.Component<PacksProps, PacksState> {

	constructor(props: PacksProps) {
		super(props);

		this.state = {
			loadingPacks: true,
			loadingFeatured: true,
			shouldShowNewPackModal: false
		};

		this.updateCollection = this.updateCollection.bind(this);
		this.updateFeaturedPacks = this.updateFeaturedPacks.bind(this);
		this.onClickUpdateBrowse = this.onClickUpdateBrowse.bind(this);
		this.onClickNewPack = this.onClickNewPack.bind(this);
	}

	updateCollection(collection: Packs) {
		this.setState({
			packs: collection,
			loadingPacks: false
		});
	}

	updateFeaturedPacks(featured: Featured) {
		this.setState({
			featuredPacks: featured.items.map( i =>  new Pack(i, {autoSync: false, setObjectMap: false})),
			loadingFeatured: false
		});
	}

	updateBrowseSections() {
		let sections: any = new Sections();

		sections.fetch({
			autoSync: false,
			success: (sections) => {
				var sectionAttributes = sections.toJSON();
				console.log(sectionAttributes);
				var sectionResult = this.state.packs.generateBrowseSections(sectionAttributes);

				let sectionRef = firebase.database().ref(`/browse`);
				sectionRef.set(sectionResult);

				prodFirebase.database().ref('/browse').set(sectionResult);
			}
		});

		this.updateFeatured();
	}

	updateFeatured() {
		this.state.featured.fetch({
			success: (featured) => {
				let data = featured.toJSON();
				prodFirebase.database().ref('/featured/packs/0').set(data);
			}
		});
	}

	componentDidMount() {
		let state = {
			packs: new Packs(),
			featured: new Featured({id: 'featuredPacks', type: MediaItemType.pack}),
			featuredPacks: [],
			loadingPacks: true,
			loadingFeatured: true
		};

		state.featured.fetch({
			success: this.updateFeaturedPacks
		});
		state.packs.fetch({
			success: this.updateCollection
		});

		this.setState(state);
	}

	componentWillUnmount() {
		this.state.packs.off('sync', this.updateCollection);
		this.state.featured.off('sync', this.updateFeaturedPacks);

	}

	onClickUpdateBrowse() {
		this.updateBrowseSections();
	}

	onClickNewPack() {
		this.setState({
			shouldShowNewPackModal: true
		});
	}

	onCloseNewPackModal() {
		this.setState({
			shouldShowNewPackModal: false
		});
	}

	onSavePack() {
		this.setState({
			shouldShowNewPackModal: false
		});
	}

	render() {

		if (this.state.loadingFeatured || this.state.loadingPacks) {
			return <div className="loader">Loading...</div>;
		}

		let packComponents = this.state.packs
			.sortBy('name')
			.filter(pack => !pack.isFavorites && !pack.isRecents && !pack.deleted);

		let featuredComponents = this.state.featuredPacks
			.filter(pack => !pack.isFavorites && !pack.isRecents && !pack.deleted);


		let content = this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Packs</h2>
					<ButtonToolbar className="pull-right">
						<ConfirmationButton confirmationText="Are you sure you want to update browse on production?"
											bsSize="small"
											onConfirmation={this.onClickUpdateBrowse}>
							Update Browse
						</ConfirmationButton>

						<Button
							bsStyle="primary"
							bsSize="small"
							onClick={this.onClickNewPack}
							active>
							New Pack
						</Button>
					</ButtonToolbar>
				</header>
				<PackGroup items={featuredComponents} type={PackGroupType.card} edit={true} title="Featured Packs"/>
				<PackGroup items={packComponents} type={PackGroupType.table} edit={true} title="All Packs"/>

				{ this.state.shouldShowNewPackModal ?
					<PackEditModal
						show={this.state.shouldShowNewPackModal}
						isNew={true}
						pack={new Pack({}, {autoSync: false, generateId: true, setObjectMap: false})}
						onClose={this.onCloseNewPackModal.bind(this)}
						onSave={this.onSavePack.bind(this)}
					/> : '' }
			</div>
		);

		return content;
	}
}
