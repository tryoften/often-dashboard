import * as React from 'react';
import { Modal, Button, Alert, Grid, Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

interface PackEditModalProps extends React.Props<PackEditModal> {
    show: boolean;
    pack: Pack;
}

interface PackEditModalState extends React.Props<PackEditModal> {
    model?: Pack;
    isNew?: boolean;
    form?: PackAttributes;
    selectedItem?: IndexableObject;
}

export default class PackEditModal extends React.Component<PackEditModalProps, PackEditModalState> {

    constructor(props: PackEditModalProps) {
        super(props);

        this.handlePropChange = this.handlePropChange.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    close() {
        this.setState({showModal: false});
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

    }

    render() {
        return (
            <Modal show={this.state.showModal} onHide={this.cancel}>
                <Model.Header>
                    <h2>Update Pack</h2>
                </Model.Header>
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
                                    id="description"
                                    type="text"
                                    placeholder="Select background color"
                                    value={form.description}
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
                                    onChange={this.handlePropChange }/>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
                <Model.Footer>
                    <Grid fluid>
                        <Row>
                            <Col md={1}>
                                <Button onClick={this.cancel}>Cancel</Button>
                            </Col>
                            <Col md={1} mdOffset={7}>
                                <ConfirmationButton bsStyle="default" onConfirmation={this.onClickRemove}> Remove </ConfirmationButton>
                            </Col>
                            <Col md={1} mdOffset={1} className="column-right-tilt">
                                <Button className="save-button" onClick={this.save}>Save</Button>
                            </Col>
                        </Row>
                    </Grid>
                </Model.Footer>
            </Modal>
        );
    }
}