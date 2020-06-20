import React, { Component } from 'react';
import classes from './InterpreterPage.module.css'

import Grid from '@material-ui/core/Grid';
import Button from '../../components/shared/Button/Button';
import TextField from '@material-ui/core/TextField';
import Avatar from '../../components/shared/Avatar/Avatar';
import HorzLine from '../../components/shared/HorzLine/HorzLine';
import FileUploader from '../../components/shared/FileUploader/FileUploader';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Rating from '@material-ui/lab/Rating';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import AddIcon from '@material-ui/icons/Add';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';

import { fetchInterpreterPage, updateInterpreterInfo } from '../../services/InterpreterService';
import { updateUserPassword } from '../../services/UserService';

class InterpreterPage extends Component {
    constructor() {
        super();
        this.state = {
            currentName: '',
            name: '',
            email: '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            avatar: '',
            file: null,  // for avatar
            location: '',
            phone: '',
            languages: [],
            certifications: [],
            services: [],
            rating: 0,
            reviews: [],
            isVerified: false,
            window: 2
        }

        this.loadData = this.loadData.bind(this);
        this.changeInput = this.changeInput.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
        this.submitInfoForm = this.submitInfoForm.bind(this);
        this.switchWindow = this.switchWindow.bind(this);
    }

    loadData = () => {
        fetchInterpreterPage()
            .then(data => {
                console.log('here', data);
                this.setState({
                    currentName: data.name,
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    location: data.location,
                    phone: data.phone,
                    languages: data.languages,
                    certifications: data.certifications,
                    services: data.services,
                    rating: data.rating,
                    reviews: data.reviews,
                    isVerified: data.isVerified,
                })
            }).catch(error => {
                console.log(error);
            })
    }

    fileUpload = (fileItem) => {
        this.setState({ file: fileItem });
    }

    componentDidMount() {
        this.loadData();
    }

    changeInput = (e) => {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
    }

    submitInfoForm = () => {
        if (!this.state.name || this.state.name === this.state.currentName) {
            alert(`Please fill out your name.`);
        } else {
            const data = {
                name: this.state.name,
                avatar: this.state.file
            };
            updateInterpreterInfo(data)
                .then(data => {
                    this.loadData();
                }).catch(error => {
                    console.log(error);
                });
        }
    }

    submitPasswordForm = () => {
        if (!this.state.currentPassword) {
            alert(`Please fill out your current password.`);
        } else if (!this.state.newPassword) {
            alert(`Please fill out your new password.`);
        } else if (this.state.newPassword !== this.state.confirmNewPassword) {
            alert(`Please check your new password.`);
        } else if (this.state.length < 8 || this.state.confirmNewPassword.length < 8) {
            alert(`Password must be at least 8 characters.`);
        } else {
            const data = {
                currentPassword: this.state.currentPassword,
                newPassword: this.state.newPassword
            };
            updateUserPassword(data)
                .then(data => {
                }).catch(error => {
                    alert("Failed To Update Password.");
                    console.log(error);
                });
        }
    }

    switchWindow = (e, i) => {
        this.setState({ window: i });
    }

    pushLangField = () => {
        const languages = this.state.languages;
        languages.push({ language: '', fluency: 0 });
        this.setState({ languages: languages });
    }

    popLangField = () => {
        const languages = this.state.languages;
        languages.pop();
        this.setState({ languages: languages });
    }

    changeLanguage = (e, i) => {
        e.preventDefault();
        const languages = this.state.languages;
        languages[i].language = e.target.value;
        this.setState({ languages: languages });
    }

    changeFluency = (e, i) => {
        e.preventDefault();
        const languages = this.state.languages;
        languages[i].fluency = e.target.value;
        this.setState({ languages: languages });
    }

    render() {
        const menuItems = ['Events', 'Reviews', 'Account Update'];
        const menu = menuItems.map((item, i) =>
            <div className={classes.menuItemWrapper}>
                <div className={(this.state.window === i) ? classes.activeDot : classes.dot} />
                <div id={`menu-item-${i}`} value={i}
                    className={(this.state.window === i) ? classes.activeMenuItem : classes.menuItem}
                    onClick={(e) => this.switchWindow(e, i)}>
                    {menuItems[i]}
                </div>
            </div>);

        const eventWindow = <div>event</div>;
        const reviewWindow = <div>reviews</div>

        const addIcon = <AddIcon className={classes.langFieldIcon} color="primary" onClick={this.pushLangField} />;
        const removeIcon = <HighlightOffIcon className={classes.langFieldIcon} color="error" onClick={this.popLangField} />;
        const fluencyChoices = [];
        for (let i = 1; i <= 5; i++) {
            fluencyChoices.push(<MenuItem id={`menu-item-${i}`} value={i}>{i}</MenuItem>)
        }
        const langFields = this.state.languages.map((lang, i) => {
            return (
                <Grid container spacing={2} id={`language-field-${i}`}>
                    <Grid item xs={7}>
                        <TextField label="Language"
                            name="language"
                            required
                            value={lang.language}
                            margin="dense"
                            fullWidth
                            variant="outlined"
                            onChange={(e) => this.changeLanguage(e, i)} />
                    </Grid>

                    <Grid item xs={3}>
                        <FormControl variant="outlined" fullWidth margin="dense">
                            <InputLabel>Fluency</InputLabel>
                            <Select label="Age"
                                value={lang.fluency}
                                onChange={(e) => this.changeFluency(e, i)}>
                                {fluencyChoices}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={2}>
                        <div className={classes.langFieldIcons}>
                            {(i > 0) ? removeIcon : null}
                            {(this.state.languages.length === 1 || i === this.state.languages.length - 1) ? addIcon : null}
                        </div>
                    </Grid>
                </Grid>
            )
        });

        const updateWindow = <>
            <Grid container spacing={2} justify='center'>
                <Grid item xs={6}>
                    <TextField label="Name"
                        name="name"
                        required
                        value={this.state.name}
                        margin="dense"
                        fullWidth
                        variant="outlined"
                        onChange={this.changeInput} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Email"
                        name="email"
                        disabled
                        required
                        value={this.state.email}
                        margin="dense"
                        fullWidth
                        variant="outlined"
                        onChange={this.changeInput} />

                </Grid>
            </Grid>
            <div className={classes.fileUpload}>
                <div className={classes.label}>Avatar</div>
                <FileUploader upload={this.state.fileUpload} />
            </div>
            {langFields}
            <div className={classes.serviceLabel}>Services:</div>
            <FormGroup row>
                <FormControlLabel control={<Checkbox color="primary" checked={this.state.services.Simultaneous} onChange={this.changeServices} name="Simultaneous" />} label="Simultaneous" />
                <FormControlLabel control={<Checkbox color="primary" checked={this.state.services.Consecutive} onChange={this.changeServices} name="Consecutive" />} label="Consecutive" />
                <FormControlLabel control={<Checkbox color="primary" checked={this.state.services.Relating} onChange={this.changeServices} name="Relating" />} label="Relating" />
                <FormControlLabel control={<Checkbox color="primary" checked={this.state.services.Translating} onChange={this.changeServices} name="Translating" />} label="Translating" />
            </FormGroup>

            <TextField label="Location"
                name="location"
                required
                value={this.state.location}
                margin="dense"
                fullWidth
                variant="outlined"
                onChange={this.changeInput} />

            <TextField label="Summary"
                name="summary"
                value={this.state.summary}
                margin="dense"
                fullWidth
                variant="outlined"
                multiline
                rows={5}
                onChange={this.changeInput} />
            <div className={classes.buttons}>
                <Button content={'Update Info'} click={this.submitInfoForm} />
            </div>

            <HorzLine />

            <TextField label="Current Password"
                name="currentPassword"
                type="password"
                required
                margin="dense"
                value={this.state.currentPassword}
                fullWidth
                variant="outlined"
                onChange={this.changeInput} />
            <Grid container spacing={2} justify='center'>
                <Grid item xs={6}>
                    <TextField label="New Password"
                        name="newPassword"
                        type="password"
                        required
                        margin="dense"
                        value={this.state.newPassword}
                        fullWidth
                        variant="outlined"
                        onChange={this.changeInput} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Confirm New Password"
                        name="confirmNewPassword"
                        type="password"
                        required
                        margin="dense"
                        value={this.state.confirmNewPassword}
                        fullWidth
                        variant="outlined"
                        onChange={this.changeInput} />
                </Grid>
            </Grid>
            <div className={classes.buttons}>
                <Button content={'Update Password'} click={this.submitPasswordForm} />
            </div>
        </>;

        const windows = [eventWindow, reviewWindow, updateWindow];

        return (
            <div className={classes.Container}>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <div className={classes.userCard}>
                            <div className={classes.userInfo}>
                                <Avatar name={this.state.name} avatar={this.state.avatar} size={7} />
                                <div>
                                    <div className={classes.flexArea}>
                                        <div className={classes.userName}>{this.state.currentName}</div>
                                        {this.state.isVerified ?
                                            <CheckCircleIcon className={classes.checkIcon}
                                                fontSize="small" color="primary" />
                                            : null}
                                    </div>
                                    <Rating className={classes.rating}
                                        size="small" value={this.state.rating}
                                        precision={0.5} readOnly />
                                </div>
                            </div>
                        </div>
                        <div className={classes.menu}>
                            {menu}
                        </div>
                        <HorzLine />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <div className={classes.window}>
                            {windows[this.state.window]}
                        </div>
                    </Grid>
                </Grid>
            </div >
        )
    }
}

export default InterpreterPage;

