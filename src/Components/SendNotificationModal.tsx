import * as React from 'react';
import { Modal, Button, Alert, Grid, Row, Col } from 'react-bootstrap';
import ConfirmationButton from './ConfirmationButton';
import { Pack, Notification } from '@often/often-core';
import { production as prodApp } from '../db';

const {FormGroup, FormControl, ControlPanel} = require('react-bootstrap');
const firebase = require('firebase');

class NotificationEnvironment extends String {
    static dev: NotificationEnvironment = "dev";
    static prod: NotificationEnvironment = "prod";
}

class NotificationScope extends String {
    static pack: NotificationScope = "pack";
    static global: NotificationScope = "global";
}

interface SendNotificationModalProps extends React.Props<SendNotificationModal> {
    show: boolean;
    close: Function;
    pack: Pack;
}

interface SendNotificationModalState {
    showModal?: boolean;
    packId?: string;
    title?: string;
    text?: string;
    env?: NotificationEnvironment
}

interface NotificationTargetAttributes {
    text: string;
    scope: NotificationScope;
    env: NotificationEnvironment;
}

export default class SendNotificationModal extends React.Component<SendNotificationModalProps, SendNotificationModalState> {

    notificationTargets: NotificationTargetAttributes[];
    titleCharLimit: number;
    textCharLimit: number;

    constructor (props: SendNotificationModalProps){
        super(props);

        this.titleCharLimit = 100;
        this.textCharLimit = 107;

        this.notificationTargets = [{
            text: "All Users (Dev)",
            scope: NotificationScope.global,
            env: NotificationEnvironment.dev
        }, {
            text: "Pack Followers (Dev)",
            scope: NotificationScope.pack,
            env: NotificationEnvironment.dev
        }, {
            text: "All Users (Prod)",
            scope:  NotificationScope.global,
            env: NotificationEnvironment.prod
        }, {
            text: "Pack Followers (Prod)",
            scope: NotificationScope.pack,
            env: NotificationEnvironment.prod
        }];

        this.state = {
            showModal: this.props.show,
            packId: NotificationScope.global.toString(),
            title: "",
            text: "",
            env: NotificationEnvironment.dev
        };

        this.close = this.close.bind(this);
    }

    onUpdatePack() {
        var rootRef;
        if (this.state.env == NotificationEnvironment.dev) {
            rootRef = firebase.database();
        } else if (this.state.env == NotificationEnvironment.prod) {

            rootRef = prodApp.database();
            let prodPack = new Pack({
                id: this.props.pack.id
            }, {
                autoSync: false,
                setObjectMap: true,
                rootRef: rootRef
            });
            prodPack.syncData().then(() => {
                prodPack.save(this.props.pack.toJSON());
            });
        } else {
            console.error('Environment not supported');
            return;
        }

        let notif = new Notification({}, {
            autoSync: false,
            setObjectMap: false,
            rootRef: rootRef
        });

        notif.save({
            packId: this.state.packId,
            title: this.state.title,
            text: this.state.text
        });

        rootRef.ref('queues/notification/tasks').push({
            notificationId: notif.id
        });

        this.close();
    }

    onSaveChanges(e) {
        e.preventDefault();
        this.setState({showModal: false});
    }

    close() {
        this.props.close();
        this.setState({showModal: false});
    }

    onSelectTarget(e: any) {

        let targetsIndex = e.target.value;
        let notifTarget = this.notificationTargets[targetsIndex];

        this.setState({
            packId: (notifTarget.scope == NotificationScope.pack) ? this.props.pack.id : NotificationScope.global,
            env: (notifTarget.env == NotificationEnvironment.dev) ? NotificationEnvironment.dev : NotificationEnvironment.prod
        });
    }

    onUpdateTitle(e: any) {
        let newTitle = e.target.value;
        if (newTitle.length > this.titleCharLimit) {
            return;
        }
        this.setState({
            title: newTitle
        })
    }

    onUpdateText(e: any) {
        let newText = e.target.value;
        if (newText.length > this.textCharLimit) {
            return;
        }
        this.setState({
            text: newText
        });
    }


    render() {

        let dropdownOptions = this.notificationTargets.map( (t, i) => {
            return (<option value={i} key={i} >{t.text}</option>)
        });

        return (
                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header>
                        <Modal.Title>Update Pack</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="notification-body">
                            <FormGroup controlId="updateTitle">
                                <div className="title">Title</div>
                                <div className="title count">{this.titleCharLimit - this.state.title.length} Characters Left</div>
                                <FormControl
                                    type="text"
                                    placeholder="Enter notification header here..."
                                    value={this.state.title}
                                    onChange={this.onUpdateTitle.bind(this)}
                                />
                            </FormGroup>
                            <FormGroup controlId="updateText">
                                <div className="title">Update Notes</div>
                                <div className="title count">{this.textCharLimit - this.state.text.length} Characters Left</div>
                                <FormControl
                                    componentClass="textarea"
                                    placeholder="Enter notification body here..."
                                    value={this.state.text}
                                    onChange={this.onUpdateText.bind(this)}
                                />
                            </FormGroup>
                            <FormGroup controlId="target">
                                <div className="title">Send Push notifications to:</div>
                                <FormControl
                                    componentClass="select"
                                    placeholder="select"
                                    onChange={this.onSelectTarget.bind(this)}>
                                    {dropdownOptions}
                                </FormControl>
                            </FormGroup>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Grid fluid>
                            <Row>
                                <Col md={1}>
                                    <Button onClick={this.close}>Cancel</Button>
                                </Col>
                                <Col md={1} mdOffset={7}>

                                </Col>
                                <Col md={1} mdOffset={1} className="column-right-tilt">
                                    <ConfirmationButton
                                        bsStyle="primary"
                                        confirmationText="Are you sure you want to publish this pack on production?"
                                        onConfirmation={this.onUpdatePack.bind(this)}
                                        disabled={!(this.state.title.length && this.state.text.length)}
                                    >
                                        Update
                                    </ConfirmationButton>
                                </Col>
                            </Row>
                        </Grid>
                    </Modal.Footer>
                </Modal>
        );
    }
}