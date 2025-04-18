import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const WarningPopup = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>NOTICE</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          ALL PLANNING CHANGES ARE IN REAL TIME
        </p>
        <p>
        This event is being planned collaboratively. If something updates on your screen, it was likely edited by a cohost.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WarningPopup;
