import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import OwnerView from '../Components/OwnerView';
import { Owners } from '@often/often-core';
import PaginationControl from '../Components/PaginationControl';

interface OwnersProps extends React.Props<OwnersRoute> {
	open?: boolean;
}

interface OwnersState extends React.Props<OwnersRoute> {
	owners?: Owners;
	loadingOwners?: boolean;
}

export default class OwnersRoute extends React.Component<OwnersProps, OwnersState> {

	constructor(props: OwnersProps) {
		super(props);
		this.state = {
			loadingOwners: true
		};
		this.updateOwners = this.updateOwners.bind(this);
	}

	componentDidMount() {

		let state = {
			owners: new Owners()
		};

		state.owners.on('update', this.updateOwners);

		state.owners.fetch({
			success: this.updateOwners
		});

		this.setState(state);
	}

	componentWillUnmount() {
		this.state.owners.off('update');
	}

	updateOwners(owners: Owners) {
		this.setState({
			owners: owners,
			loadingOwners: false
		});
	}

	render() {

		if(this.state.loadingOwners) {
			return <div>Loading...</div>
		}
		let ownerComponents = this.state.owners.sortBy('name').map(owner => {
			return (
				<Link key={owner.id} to={`/owner/${owner.id}`}>
					<OwnerView key={owner.id} model={owner}></OwnerView>
				</Link>
			);
		});

		return this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Owners</h2>

					<ButtonToolbar className="pull-right">
						<Link to="/owner">
							<Button bsStyle="primary" bsSize="small" active>Add Owner</Button>
						</Link>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								{ownerComponents}
							</div>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
