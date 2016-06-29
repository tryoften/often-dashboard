import * as React from 'react';
import { Modal, Button, Alert, Grid, Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { Pack } from '@often/often-core';

interface SendNotificationModalProps extends React.Props<SendNotificationModal> {
    show: boolean;
    pack: Pack;
}

interface SendNotificationModalState {

}

export default class SendNotificationModal extends React.Component<SendNotificationModalProps, SendNotificationModalState> {

    onSaveChanges(e) {
        e.preventDefault();
        this.props.onUpdatePackItems(this.state.selectedItems);
        this.setState({showModal: false});
    }

    close() {
        this.setState({showModal: false});
    }

    render() {
        return (
            <Modal show={this.state.showModal} onHide={this.cancel}>
                <Model.Header>
                    <h2>Update Pack</h2>
                </Model.Header>
                <Modal.Body>
                    <div>
                        <FormGroup controlId="updateText">
                            <ControlLabel>Update notes</ControlLabel>
                            <FormControl componentClass="textarea" />
                        </FormGroup>

                        <FormGroup controlId="target">
                            <ControlLabel>Send Push notifications to:</ControlLabel>
                            <FormControl componentClass="select" placeholder="select">
                                <option value="all">All Users (Global)</option>
                                <option value="pack">Pack followers</option>
                            </FormControl>
                        </FormGroup>
                    </div>
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