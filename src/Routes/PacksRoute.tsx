import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import PackGroup from '../Components/PackGroup';
import { Packs, Pack, Featured, MediaItemType } from '@often/often-core';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
}

export default class PacksRoute extends React.Component<PacksProps, PacksState> {

	constructor(props: PacksProps) {
		super(props);

		this.state = {
			loadingPacks: true,
			loadingFeatured: true,
			sampleSize: 5
		};
		this.updateCollection = this.updateCollection.bind(this);
		this.updateFeaturedPacks = this.updateFeaturedPacks.bind(this);
	}

	updateCollection(collection: Packs) {
		this.setState({
			packs: collection,
			loadingPacks: false
		});
	}

	updateFeaturedPacks(featured: Featured) {
		this.setState({
			featuredPacks: featured.items.map( indexableAttributes => {
				return new Pack(indexableAttributes);
			}),
			loadingFeatured: false
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

	render() {


		let packsHolder;
		if (!this.state.loadingPacks) {
			let packComponents = this.state.packs
				.filter(pack => !pack.isFavorites && !pack.isRecents && !pack.deleted);
			packsHolder = (<PackGroup items={packComponents} title="All Packs" edit={true} type="table"/>);
		} else {
			packsHolder = (<h4> Loading Packs...</h4>);
		}

		let featuredHolder;
		if (!this.state.loadingFeatured) {
			let featuredComponents = this.state.featuredPacks
				.filter(pack => !pack.isFavorites && !pack.isRecents && !pack.deleted);
			featuredHolder = (<PackGroup items={featuredComponents} title="All Packs" edit={true} type="card"/>);
		} else {
			featuredHolder = (<h4> Loading Featured Packs...</h4>);
		}

		let content = this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Packs</h2>
					<ButtonToolbar className="pull-right">
						<Link to="/pack">
							<Button bsStyle="primary" bsSize="small" active>New Pack</Button>
						</Link>
					</ButtonToolbar>
				</header>
				{featuredHolder}
				{packsHolder}
			</div>

		);

		return content;
	}
}
