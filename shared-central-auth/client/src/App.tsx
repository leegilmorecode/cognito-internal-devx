import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';

import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import CloseIcon from '@mui/icons-material/Close';
import ControlPointTwoToneIcon from '@mui/icons-material/ControlPointTwoTone';
import DnsTwoToneIcon from '@mui/icons-material/DnsTwoTone';
import { IconButton } from '@mui/material';
import PersonPinCircleTwoToneIcon from '@mui/icons-material/PersonPinCircleTwoTone';
import PlaylistAddCircleTwoToneIcon from '@mui/icons-material/PlaylistAddCircleTwoTone';
import WebAssetTwoToneIcon from '@mui/icons-material/WebAssetTwoTone';
import axios from 'axios';

interface Client {
  clientId: string;
  clientName: string;
  scopes: string[];
  userPoolId: string;
  creationDate: string;
  lastModifiedDate: string;
  allowedOAuthScopes: string[];
}

const apiUrl =
  'https://your-central-auth-rest-api-id.execute-api.eu-west-1.amazonaws.com/prod/';

const App = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewClientDialogOpen, setViewClientDialogOpen] = useState(false);
  const [
    confirmResourceServerDeleteDialogOpen,
    setConfirmResourceServerDeleteDialogOpen,
  ] = useState(false);
  const [
    resourceServerIdentifierToDelete,
    setResourceServerIdentifierToDelete,
  ] = useState('');
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState('');
  const [openCreateResourceServerModal, setOpenCreateResourceServerModal] =
    useState(false);
  const [openCreateClientModal, setOpenCreateClientModal] = useState(false);
  const [resourceServers, setResourceServers] = useState<
    {
      identifier: string;
      name: string;
      scopes: { scopeName: string; scopeDescription: string }[];
    }[]
  >([]);

  const [clients, setClients] = useState<
    { clientId: string; clientName: string; scopes: string[] }[]
  >([]);

  const [newResourceServerScopes, setNewResourceServerScopes] = useState([
    { scopeName: '', scopeDescription: '' },
  ]);
  const [newResourceServerIdentifier, setNewResourceServerIdentifier] =
    useState('');
  const [newResourceServerName, setNewResourceServerName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientScopes, setNewClientScopes] = useState([
    { scopeName: '', scopeDescription: '' },
  ]);

  const resetCreateClientModal = () => {
    setNewClientName('');
    setNewClientScopes([{ scopeName: '', scopeDescription: '' }]);
    setOpenCreateClientModal(false);
  };

  const resetCreateResourceServerModal = () => {
    setNewResourceServerIdentifier('');
    setNewResourceServerName('');
    setNewResourceServerScopes([{ scopeName: '', scopeDescription: '' }]);
    setOpenCreateResourceServerModal(false);
  };

  const handleViewClient = async (clientId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/clients/${clientId}`);
      setSelectedClient(response.data);
      setViewClientDialogOpen(true);
    } catch (error) {
      console.error('error fetching client:', error);
    }
  };

  const handleCloseViewClientDialog = () => {
    setViewClientDialogOpen(false);
  };

  const handleScopeNameChange = (value: string, index: number) => {
    const updatedScopes = [...newResourceServerScopes];
    updatedScopes[index].scopeName = value;
    setNewResourceServerScopes(updatedScopes);
  };

  const handleClientScopeNameChange = (value: string, index: number) => {
    const updatedScopes = [...newClientScopes];
    updatedScopes[index].scopeName = value;
    setNewClientScopes(updatedScopes);
  };

  const handleScopeDescriptionChange = (value: string, index: number) => {
    const updatedScopes = [...newResourceServerScopes];
    updatedScopes[index].scopeDescription = value;
    setNewResourceServerScopes(updatedScopes);
  };

  const addScopeField = () => {
    setNewResourceServerScopes([
      ...newResourceServerScopes,
      { scopeName: '', scopeDescription: '' },
    ]);
  };

  const addClientScopeField = () => {
    setNewClientScopes([
      ...newClientScopes,
      { scopeName: '', scopeDescription: '' },
    ]);
  };

  const removeClientScopeField = (indexToRemove: number) => {
    const updatedScopes = newClientScopes.filter(
      (_, index) => index !== indexToRemove
    );
    setNewClientScopes(updatedScopes);
  };

  const handleCreateResourceServer = async () => {
    try {
      await axios.post(`${apiUrl}/resource-servers`, {
        identifier: newResourceServerIdentifier,
        name: newResourceServerName,
        scopes: newResourceServerScopes,
      });
      fetchResourceServers();
      resetCreateResourceServerModal();
    } catch (error) {
      console.error('error creating resource server:', error);
    }
  };

  const handleCreateClient = async () => {
    try {
      const scopes = newClientScopes.map((scope) => `${scope.scopeName}`);
      await axios.post(`${apiUrl}/clients`, {
        clientName: newClientName,
        scopes: scopes,
      });
      fetchClients();
      resetCreateClientModal();
    } catch (error) {
      console.error('error creating client:', error);
    }
  };

  const fetchResourceServers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/resource-servers`);
      setResourceServers(response.data);
    } catch (error) {
      console.error('error fetching resource servers:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${apiUrl}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('error fetching clients:', error);
    }
  };

  const removeScopeField = (indexToRemove: number) => {
    const updatedScopes = newResourceServerScopes.filter(
      (_, index) => index !== indexToRemove
    );
    setNewResourceServerScopes(updatedScopes);
  };

  const handleDeleteClient = async (clientIdToDelete: string) => {
    try {
      await axios.delete(`${apiUrl}/clients/${clientIdToDelete}`);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleOpenConfirmDeleteDialog = (clientId: string) => {
    setClientIdToDelete(clientId);
    setConfirmDeleteDialogOpen(true);
  };

  const handleCloseConfirmDeleteDialog = () => {
    setConfirmDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteClient(clientIdToDelete);
    handleCloseConfirmDeleteDialog();
  };

  const handleDeleteResourceServer = async (identifierToDelete: string) => {
    try {
      await axios.delete(`${apiUrl}/resource-servers/${identifierToDelete}`);
      fetchResourceServers();
    } catch (error) {
      console.error('Error deleting resource server:', error);
    }
  };

  const handleOpenConfirmResourceServerDeleteDialog = (identifier: string) => {
    setResourceServerIdentifierToDelete(identifier);
    setConfirmResourceServerDeleteDialogOpen(true);
  };

  const handleCloseConfirmResourceServerDeleteDialog = () => {
    setConfirmResourceServerDeleteDialogOpen(false);
  };

  const handleConfirmResourceServerDelete = () => {
    handleDeleteResourceServer(resourceServerIdentifierToDelete);
    handleCloseConfirmResourceServerDeleteDialog();
  };

  useEffect(() => {
    fetchResourceServers();
    fetchClients();
  }, []);

  return (
    <Box m={10}>
      <h1>
        Central Auth Service <BadgeTwoToneIcon />
      </h1>
      <h5>
        <PersonPinCircleTwoToneIcon /> Logged in as: Tom Jones | Log Out
      </h5>
      <Divider />
      <div>
        <Dialog
          open={openCreateResourceServerModal}
          onClose={() => setOpenCreateResourceServerModal(false)}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
          fullWidth
          maxWidth="sm"
        >
          <Box p={3}>
            <IconButton
              aria-label="close"
              onClick={() => setOpenCreateResourceServerModal(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" gutterBottom>
              Create Resource Server
            </Typography>
            <p>
              Create a Resource Server for a service you want to secure with
              certain scopes which you can give one or more clients access too.
            </p>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Identifier"
                    value={newResourceServerIdentifier}
                    onChange={(e) =>
                      setNewResourceServerIdentifier(e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={newResourceServerName}
                    onChange={(e) => setNewResourceServerName(e.target.value)}
                  />
                </Grid>
                {newResourceServerScopes.map((scope, index) => (
                  <Fragment key={index}>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Scope Name"
                        value={scope.scopeName}
                        onChange={(e) =>
                          handleScopeNameChange(e.target.value, index)
                        }
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Scope Description"
                        value={scope.scopeDescription}
                        onChange={(e) =>
                          handleScopeDescriptionChange(e.target.value, index)
                        }
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => removeScopeField(index)}
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Fragment>
                ))}

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={addScopeField}
                    startIcon={<PlaylistAddCircleTwoToneIcon />}
                  >
                    Add Scope
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateResourceServer}
                    startIcon={<ControlPointTwoToneIcon />}
                  >
                    Create
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Dialog>

        <Dialog
          open={openCreateClientModal}
          onClose={() => setOpenCreateClientModal(false)}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
          fullWidth
          maxWidth="sm"
        >
          <Box p={3} textAlign="center">
            <IconButton
              aria-label="close"
              onClick={() => setOpenCreateClientModal(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" gutterBottom>
              Create Client
            </Typography>
            <p>
              Create a client which has access to a given resource server only
              for specific scopes.
            </p>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </Grid>
                {newClientScopes.map((scope, index) => (
                  <Fragment key={index}>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="Scope Name"
                        value={scope.scopeName}
                        onChange={(e) =>
                          handleClientScopeNameChange(e.target.value, index)
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => removeClientScopeField(index)}
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Fragment>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={addClientScopeField}
                    startIcon={<PlaylistAddCircleTwoToneIcon />}
                  >
                    Add Scope
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateClient}
                    startIcon={<ControlPointTwoToneIcon />}
                  >
                    Create
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Dialog>
      </div>
      <h2>Resource Servers</h2>
      <p>
        Create a Resource Server for a service you want to secure with certain
        scopes which you can give one or more clients access too.
      </p>
      <Button
        variant="contained"
        startIcon={<DnsTwoToneIcon />}
        onClick={() => setOpenCreateResourceServerModal(true)}
      >
        Create New Resource Server
      </Button>
      <List>
        {resourceServers.map((server) => (
          <Box my={2} key={server.identifier}>
            <ListItem>
              <ListItemText
                primary={server.name}
                secondary={server.identifier}
              />
              <ListItemText
                primary="Scopes"
                secondary={
                  <ul>
                    {server.scopes.map((scope, index) => (
                      <li key={index}>
                        {scope.scopeDescription} ({scope.scopeName})
                      </li>
                    ))}
                  </ul>
                }
              />
              <Button
                variant="contained"
                color="warning"
                startIcon={<CloseIcon />}
                onClick={() =>
                  handleOpenConfirmResourceServerDeleteDialog(server.identifier)
                }
              >
                Delete
              </Button>
            </ListItem>
          </Box>
        ))}
      </List>
      <Dialog
        open={confirmResourceServerDeleteDialogOpen}
        onClose={handleCloseConfirmResourceServerDeleteDialog}
      >
        <DialogTitle>Delete Resource Server</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this resource server?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmResourceServerDeleteDialog}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmResourceServerDelete}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Divider />
      <h2>Clients</h2>
      <p>
        Create a client which has access to a given resource server only for
        specific scopes.
      </p>
      <Button
        variant="contained"
        onClick={() => setOpenCreateClientModal(true)}
        startIcon={<WebAssetTwoToneIcon />}
      >
        Create New Client
      </Button>
      <List>
        {clients.map((client) => (
          <ListItem key={client.clientId}>
            <ListItemText
              primary={client.clientName}
              secondary={client.clientId}
            />
            <Button
              variant="outlined"
              onClick={() => handleViewClient(client.clientId)}
              startIcon={<WebAssetTwoToneIcon />}
            >
              View
            </Button>
            <Button
              sx={{ marginLeft: '10px' }}
              variant="outlined"
              onClick={() => {}}
              disabled={true}
            >
              Update
            </Button>
            <Button
              sx={{ marginLeft: '10px' }}
              startIcon={<CloseIcon />}
              variant="contained"
              color="warning"
              onClick={() => handleOpenConfirmDeleteDialog(client.clientId)}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={handleCloseConfirmDeleteDialog}
      >
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this client?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={viewClientDialogOpen} onClose={handleCloseViewClientDialog}>
        <DialogTitle>Client Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Client Name:
              </Typography>
              <Typography variant="body1">
                {selectedClient && selectedClient.clientName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Client ID:
              </Typography>
              <Typography variant="body1">
                {selectedClient && selectedClient.clientId}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                User Pool ID:
              </Typography>
              <Typography variant="body1">
                {selectedClient && selectedClient.userPoolId}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Creation Date:
              </Typography>
              <Typography variant="body1">
                {selectedClient && selectedClient.creationDate}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Last Modified Date:
              </Typography>
              <Typography variant="body1">
                {selectedClient && selectedClient.lastModifiedDate}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Allowed OAuth Scopes:
              </Typography>
              <ul>
                {selectedClient &&
                  selectedClient.allowedOAuthScopes.map(
                    (scope: string, index: number) => (
                      <li key={index}>
                        <Typography variant="body1">{scope}</Typography>
                      </li>
                    )
                  )}
              </ul>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewClientDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Divider />
    </Box>
  );
};

export default App;
