import * as React from 'react';
import * as objectPath from 'object-path';
import { IndexableObject, Image, Pack, Section, SectionAttributes, Sections, PackAttributes } from '@often/often-core';
import { Modal, Button, Alert, Grid, Row, Col, MenuItem, DropdownButton } from 'react-bootstrap';
const { FormGroup, FormControl, ControlLabel, Checkbox } = require('react-bootstrap');

import ConfirmationButton from '../Components/ConfirmationButton';

interface PackEditModalProps extends React.Props<PackEditModal> {
    show: boolean;
    pack: Pack;
    onClose: () => void;
    onSave: () => void;
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
            isNew: false,
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
        this.props.onSave();
    }

    onClickDelete(e) {
        e.preventDefault();
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

        let sectionMenuItems = this.state.sections ? this.state.sections.map( section => {
            return <MenuItem
                key={section.id}
                eventKey={section.id}
                onClick={this.onClickSection.bind(this, section)}>
                {section.name}
            </MenuItem>;
        }) : '';

        return (
            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>Update Pack</Modal.Title>
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
                        <DropdownButton
                            id="select-section"
                            bsStyle="default"
                            title={this.state.selectedSection ? this.state.selectedSection.name : 'No Section'}
                            block>
                            {sectionMenuItems}
                        </DropdownButton>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Featured</ControlLabel>
                        <Checkbox
                            id="featured"
                            checked={form.featured}
                            onChange={this.handlePropChange}/>
                    </FormGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="pull-left" onClick={this.close}>Cancel</Button>
                    <Button {...form.published ? {bsStyle: 'primary'} :  {}} onClick={this.togglePublish}>
                        { form.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button className="save-button" onClick={this.handleUpdate}>Save</Button>
                    <ConfirmationButton bsStyle="danger" onConfirmation={this.onClickDelete}>Delete</ConfirmationButton>
                </Modal.Footer>
            </Modal>
        );
    }
}