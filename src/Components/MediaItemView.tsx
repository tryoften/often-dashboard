import * as React from 'react';
import * as classNames from 'classnames';
import { IndexableObject, TrackIndexableObject, ArtistIndexableObject, MediaItemType, GIFAttributes } from '@often/often-core';
import ImageBrandMask from '../Components/ImageBrandMask';

interface SearchResultItemViewProps extends React.Props<MediaItemView> {
	item: IndexableObject;
	selected?: boolean;
	onSelect?: (item: IndexableObject) => void;
}

export default class MediaItemView extends React.Component<SearchResultItemViewProps, {}> {
	onSelect() {
		if (this.props.onSelect) {
			this.props.onSelect(this.props.item);
		}
	}

	render() {
		let type = this.props.item ? ( this.props.item._type || '').toString() : '';
		let classes = classNames("media-item pull-left", type, {"selected": this.props.selected});

		switch (this.props.item._type) {
			case MediaItemType.quote:
			case MediaItemType.lyric:
				return (
					<div className={classes} onClick={this.onSelect.bind(this)}>
						<div className="content">
							{this.props.item.text}
						</div>
					</div>
				);

			case MediaItemType.track:
				return (
					<div className={classes} onClick={this.onSelect.bind(this)}>
						<div className="image">
							<img src={(this.props.item as TrackIndexableObject).song_art_image_url}/>
						</div>
						<div className="meta">
							<div className="title">
								{this.props.item.title}
							</div>
							<div className="artist">
								{this.props.item.author}
							</div>
						</div>
					</div>
				);

			case MediaItemType.artist:
				let artistItem = this.props.item as ArtistIndexableObject;

				return (
					<div className={classes} id={artistItem._id} onClick={this.onSelect.bind(this)}>
						<div className="image-container" style={{backgroundImage: `url(${artistItem.image_url})`}}>
							<ImageBrandMask />
						</div>
						<div className="meta">
							<div className="title">{artistItem.name}</div>
							<div className="subtitle">{artistItem.tracks_count} items</div>
						</div>
					</div>
				);

			case MediaItemType.gif:
				let gif = this.props.item as GIFAttributes;

				return (
					<div className={classes} onClick={this.onSelect.bind(this)}>
						<img src={gif.image.medium_url} />
					</div>
				);
			default:
				return <div></div>;
		}
	}
}
