import * as React from 'react';
import * as objectPath from 'object-path';
import { IndexableObject, Image, Pack, PackAttributes } from '@often/often-core';
import { Modal, Button, ButtonToolbar, Alert, Grid, Row, Col } from 'react-bootstrap';
const { FormGroup, FormControl, ControlLabel } = require('react-bootstrap');

import ConfirmationButton from '../Components/ConfirmationButton';

interface PackEditModalProps extends React.Props<PackEditModal> {
    show: boolean;
    pack: Pack;
    onClose: () => void;
    onSave: () => void;
}

interface PackEditModalState extends React.Props<PackEditModal> {
    model?: Pack;
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
            model: props.pack,
            form: props.pack.toJSON()
        };

        this.handlePropChange = this.handlePropChange.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.close = this.close.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.togglePublish = this.togglePublish.bind(this);
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

    render() {
        let form = this.state.form;

        return (
            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header>
                    <h2>Update Pack</h2>
                </Modal.Header>
                <Modal.Body>
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
                            <FormGroup>
                                <ControlLabel>Background Color</ControlLabel>
                                <FormControl
                                    id="backgroundColor"
                                    type="text"
                                    placeholder="#000000"
                                    value={form.backgroundColor}
                                    onChange={this.handlePropChange}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2} md={2}>
                            <FormGroup>
                                <ControlLabel>Featured</ControlLabel>
                                <FormControl
                                    id="featured"
                                    type="checkbox"
                                    checked={form.featured}
                                    onChange={this.handlePropChange}/>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonToolbar>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button className="save-button" onClick={this.handleUpdate}>Save</Button>
                        <Button {...form.published ? {bsStyle: 'primary'} :  {}} onClick={this.togglePublish}>{ form.published ? 'Unpublish' : 'Publish'}</Button>
                        <ConfirmationButton bsStyle="danger" onConfirmation={this.onClickDelete}>Delete</ConfirmationButton>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal>
        );
    }
}