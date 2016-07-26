import * as _ from 'underscore';
import * as React from 'react';
import { ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
const InfiniteScroll = require('react-infinite-scroller');

export interface IndexRange {
	start: number;
	end: number;
}

interface InfiniteScrollProps extends React.Props<InfiniteScrollPagination> {
	items: React.ReactNode[];
}

interface InfiniteScrollState {
	items?: React.ReactNode[];
	hasMore?: boolean
}

export default class InfiniteScrollPagination extends React.Component<InfiniteScrollProps, InfiniteScrollState> {

	static DEFAULT_PAGE_SIZE = 20;

	constructor(props: InfiniteScrollProps) {
		super(props);

		this.state = {
			items: [],
			hasMore: false
		};

		this.loadMore = this.loadMore.bind(this);
		this.getIndexRange = this.getIndexRange.bind(this);
	}

	componentDidMount() {
		this.setState({
			items:  this.props.items.slice(0, InfiniteScrollPagination.DEFAULT_PAGE_SIZE),
			hasMore: true
		});
	}

	getIndexRange(pageToLoad: number) {
		let start = pageToLoad * InfiniteScrollPagination.DEFAULT_PAGE_SIZE;
		let end = Math.min(start + InfiniteScrollPagination.DEFAULT_PAGE_SIZE, this.props.items.length - 1);

		return {
			start: start,
			end: end
		};
	}

	loadMore(pageToLoad: number) {
		let indexRange = this.getIndexRange(pageToLoad);
		let nextItems = this.props.items.slice(indexRange.start, indexRange.end);
		let state: InfiniteScrollState = {
			items: this.state.items.concat(nextItems)
		};
		if(indexRange.end >= this.props.items.length - 1) {
			state.hasMore = false;
		}
		setTimeout(() => {
			this.setState(state);
		}, 500);
	}

	render() {
		return (
			<InfiniteScroll
				pageStart={0}
				loadMore={this.loadMore}
				hasMore={this.state.hasMore}
				loader={<div className="loader">Loading ...</div>}>
				<div className="pagination">
					<div className="items">
						{this.state.items}
					</div>
				</div>
			</InfiniteScroll>
		);
	}

}
