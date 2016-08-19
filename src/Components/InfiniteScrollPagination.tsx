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
	pageSize?: number;
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
		this.getPageSize = this.getPageSize.bind(this);
	}

	componentDidMount() {
		let range = this.getIndexRange(0);
		this.setState({
			items:  this.props.items.slice(range.start, range.end),
			hasMore: true
		});
	}

	getPageSize(): number {
		return this.props.pageSize || InfiniteScrollPagination.DEFAULT_PAGE_SIZE;
	}

	getIndexRange(pageToLoad: number) {
		let start = pageToLoad * this.getPageSize();
		let end = Math.min(start + this.getPageSize(), this.props.items.length - 1);

		return {
			start: start,
			end: end
		};
	}

	loadMore(pageToLoad: number) {
		let indexRange = this.getIndexRange(pageToLoad);
		let nextItems = this.props.items.slice(indexRange.start, indexRange.end + 1);
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
					{this.state.items}
				</div>
			</InfiniteScroll>
		);
	}

}
