// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import classNames from "classnames";
import * as React from "react";
import * as ReactDOM from "react-dom";
import FocusLock from "react-focus-lock";
import * as QuitIcon from "readium-desktop/renderer/assets/icons/baseline-close-24px.svg";
import * as stylesButtons from "readium-desktop/renderer/assets/styles/components/buttons.css";
import * as stylesModals from "readium-desktop/renderer/assets/styles/components/modals.css";
import SVG from "readium-desktop/renderer/common/components/SVG";

import { TranslatorProps, withTranslator } from "../hoc/translator";
import { TDispatch } from "readium-desktop/typings/redux";
import { dialogActions } from "readium-desktop/common/redux/actions";
import { connect } from "react-redux";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBaseProps extends TranslatorProps {
    className?: string;
    id?: string;
    title: string;
    children: React.ReactNode;
    onSubmitButton?: () => void;
    submitButtonTitle?: string;
    submitButtonDisabled?: boolean;
    shouldOkRefEnabled?: boolean;
    noFooter?: boolean;
    close?: () => void;
}
// IProps may typically extend:
// RouteComponentProps
// ReturnType<typeof mapStateToProps>
// ReturnType<typeof mapDispatchToProps>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps extends IBaseProps, ReturnType<typeof mapDispatchToProps> {
}

class Dialog extends React.Component<IProps, undefined> {
    private appElement: HTMLElement;
    private appOverlayElement: HTMLElement;
    private rootElement: HTMLElement;
    private okRef: React.RefObject<HTMLButtonElement>;

    constructor(props: IProps) {
        super(props);

        this.appElement = document.getElementById("app");
        this.appOverlayElement = document.getElementById("app-overlay");
        this.rootElement = document.createElement("div");

        this.okRef = React.createRef<HTMLButtonElement>();
    }
    public componentDidMount() {
        this.appElement.setAttribute("aria-hidden", "true");
        this.appOverlayElement.appendChild(this.rootElement);

        if (this.props.shouldOkRefEnabled && this.okRef?.current)
            this.okRef.current.focus();
    }
    public componentWillUnmount() {
        this.appElement.setAttribute("aria-hidden", "false");
        this.appOverlayElement.removeChild(this.rootElement);
    }

    public render(): React.ReactElement<{}> {
        const content = this.props.children;
        // const dialogTitle = this.props.children;
        const className = this.props.className;
        const { __ } = this.props;
        return ReactDOM.createPortal(
            (
                <FocusLock>
                    <div
                        id="dialog"
                        role="dialog"
                        aria-labelledby="dialog-title"
                        aria-describedby="dialog-desc"
                        aria-modal="true"
                        aria-hidden={"false"}
                        tabIndex={-1}
                        className={stylesModals.modal_dialog_overlay}
                        onKeyDown={this.handleKeyPress}
                    >
                        <div onClick={this.props.closeDialog} className={stylesModals.modal_dialog_overlay_hidden} />
                        <div
                            role="document"
                            id={this.props.id}
                            className={classNames(className, stylesModals.modal_dialog)}
                        >
                            <div className={stylesModals.modal_dialog_header}>
                                <h2>{this.props.title}</h2>
                                <button
                                    type="button"
                                    aria-label={__("accessibility.closeDialog")}
                                    title={__("dialog.closeModalWindow")}
                                    data-dismiss="dialog"
                                    onClick={this.props.closeDialog}
                                    className={stylesButtons.button_transparency_icon}
                                >
                                    <SVG ariaHidden={true} svg={QuitIcon} />
                                </button>
                            </div>
                            {
                                this.props.noFooter // cf PublicationInfoManager
                                    ? <div
                                            className={classNames(stylesModals.modal_dialog_body)}
                                        >
                                            {content}
                                        </div>
                                    : <form className={stylesModals.modal_dialog_form_wrapper}
                                        onSubmit={this.submitForm}
                                    >
                                        <div
                                            className={classNames(stylesModals.modal_dialog_body, stylesModals.modal_dialog_body_centered)}
                                            onKeyDown={(e) => e.key === "Enter" ? this.submitForm(e) : undefined}
                                        >
                                            {content}
                                        </div>
                                        <div className={stylesModals.modal_dialog_footer}>
                                            <button
                                                onClick={this.props.closeDialog}
                                                className={stylesButtons.button_secondary}
                                            >
                                                {__("dialog.cancel")}
                                            </button>
                                            <button
                                                disabled={this.props.submitButtonDisabled || false}
                                                type="submit"
                                                className={stylesButtons.button_primary}
                                                ref={this.okRef}
                                            >
                                                {this.props.submitButtonTitle}
                                            </button>
                                        </div>
                                    </form>
                            }
                        </div>
                    </div>
                </FocusLock>
            ),
            this.rootElement,
        );
    }

    private submitForm = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        this.submit();
    };

    private submit = () => {
        if (this.props.onSubmitButton)
            this.props.onSubmitButton();
        this.props.closeDialog();
    };

    private handleKeyPress: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === "Escape") {
            if (this.props.close) {
                this.props.close();
            } else {
                this.props.closeDialog();
            }
        }
    };
}

const mapDispatchToProps = (dispatch: TDispatch, _props: IBaseProps) => {
    return {
        closeDialog: () => {
            dispatch(
                dialogActions.closeRequest.build(),
            );
        },
    };
};



export default connect(undefined, mapDispatchToProps)(withTranslator(Dialog));
