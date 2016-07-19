import * as React from 'react';
import * as objectPath from 'object-path';
import { Link, browserHistory } from 'react-router';
import { IndexableObject, Image, Pack, Section, SectionAttributes, Sections, PackAttributes } from '@often/often-core';
import { Modal, Button, Alert, Grid, Row, Col, MenuItem, DropdownButton } from 'react-bootstrap';
const { FormGroup, FormControl, ControlLabel, Checkbox, InputGroup } = require('react-bootstrap');

import ConfirmationButton from '../Components/ConfirmationButton';

interface PackEditModalProps extends React.Props<PackEditModal> {
    show: boolean;
    pack: Pack;
    onClose: () => void;
    onSave: () => void;
    isNew: boolean;
}

interface PackEditModalState extends React.Props<PackEditModal> {
    model?: Pack;
    sections?: SectionAttributes[];
    selectedSection?: SectionAttributes;
    isNew?: boolean;
    form?: PackAttributes;
    showModal?: boolean;
}

export default class PackEditModal extends React.Component<PackEditModalProps, PackEditModalState> {
    constructor(props: PackEditModalProps) {
        super(props);

        this.state = {
            isNew: props.isNew,
            showModal: props.show,
            selectedSection: props.pack.section,
            model: props.pack,
            form: props.pack.toJSON()
        };

        this.updateStateWithSections = this.updateStateWithSections.bind(this);
        this.handlePropChange = this.handlePropChange.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.close = this.close.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.onClickSection = this.onClickSection.bind(this);
        this.togglePublish = this.togglePublish.bind(this)
    }

    componentDidMount() {
        let sections: any = new Sections();

        sections.fetch({
            autoSync: false,
            success: this.updateStateWithSections
        })
    }

    updateStateWithSections(sections: Sections) {
        let items = sections.map(a => a.toJSON());
        console.log(items);

        this.setState({
            sections: items
        });
    }

    close() {
        this.props.onClose();
        this.setState({showModal: false});
    }

    togglePublish(e) {
        let form = this.state.form;
        form.published = !form.published;
        form.publishedTime = new Date().toISOString();
        this.setState({form});
        this.handleUpdate(e);
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
            case 'select-one':
                value = JSON.parse(value);
                break;
            default:
                break;
        }

        objectPath.set(form, id, value);
        this.setState({form});
    }

    handleUpdate(e) {
        e.preventDefault();

        let model: any = this.state.model;
        let form = this.state.form;

        model.save(form, {
            success: () => {
                if (this.state.isNew) {
                    browserHistory.push(`/pack/${model.id}`);
                }
            }
        });
        model.updateFeatured();

        this.setState({model: model, isNew: false, form: model.toJSON()});
        this.props.onSave();
    }

    onClickDelete(e) {
        this.state.model.destroy();
        this.close();
        browserHistory.push('/packs');
    }

    onClickSection(section: SectionAttributes) {
        if (!this.state.selectedSection || (section.id !== this.state.selectedSection.id)) {
            let form = this.state.form;
            form.section = section;

            this.setState({
                form,
                selectedSection: section
            });
        }
    }

    render() {
        let form = this.state.form;
        let selectedSection = this.state.selectedSection || {};
        let sectionValue = selectedSection ? JSON.stringify(selectedSection) : '';
        let isNew = this.state.isNew;

        let sectionMenuItems = this.state.sections ? this.state.sections.map( section => {
            return <option
                key={section.id}
                value={JSON.stringify(section)}
                selected={selectedSection.id === section.id}>
                {section.name}
            </option>;
        }) : '';

        let publishButton = !isNew ?
            (<Button {...form.published ? {bsStyle: 'primary'} : {}} onClick={this.togglePublish}>
                { form.published ? 'Unpublish' : 'Publish'}
            </Button>)
         : '';

        let deleteButton = !isNew ?
            <ConfirmationButton bsStyle="danger" onConfirmation={this.onClickDelete}>
                Delete
            </ConfirmationButton>
            : '';

        return (
            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>{isNew ? 'New Pack' : 'Update Pack'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                            componentClass="textarea"
                            type="textarea"
                            placeholder="Description"
                            value={form.description}
                            onChange={this.handlePropChange}/>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Background Color</ControlLabel>
                        <FormControl
                            id="backgroundColor"
                            type="text"
                            placeholder="#000000"
                            value={form.backgroundColor}
                            onChange={this.handlePropChange}/>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Select Section</ControlLabel>
                        <FormControl
                            id="section"
                            componentClass="select"
                            onChange={this.handlePropChange}
                            block>
                            <option value="">No Section</option>
                            {sectionMenuItems}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <Checkbox
                            id="featured"
                            checked={form.featured}
                            onChange={this.handlePropChange}>
                            Featured
                        </Checkbox>
                    </FormGroup>
                    {this.state.isNew ?
                        <FormGroup>
                            <ControlLabel>Upload a Photo</ControlLabel>
                            <InputGroup>
                                <FormControl
                                    id="image_url"
                                    onChange={this.handlePropChange}
                                    type="text">
                                </FormControl>
                                <InputGroup.Addon>
                                    <Button>Browse</Button>
                                </InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                        : ''}

                </Modal.Body>
                <Modal.Footer>
                    <Button className="pull-left" onClick={this.close}>Cancel</Button>
                    {publishButton}
                    {deleteButton}
                    <Button className="save-button" onClick={this.handleUpdate}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}