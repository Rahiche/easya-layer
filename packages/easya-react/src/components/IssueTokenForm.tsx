import React, { useState, useMemo } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';
import { BlockchainValues } from './types';

interface FieldConfig {
    show: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
}

interface TokenFormConfig {
    currencyCode: FieldConfig;
    amount: FieldConfig;
    transferRate: FieldConfig;
    tickSize: FieldConfig;
    domain: FieldConfig;
    requireDestTag: FieldConfig;
    disallowXRP: FieldConfig;
}

interface TokenIssuanceFormProps {
    className?: string;
}

const defaultConfig: TokenFormConfig = {
    currencyCode: {
        show: true,
        required: true,
        label: 'Currency Code:',
        placeholder: 'USD, EUR, FOO, etc.'
    },
    amount: {
        show: true,
        required: true,
        label: 'Amount to Issue:',
        placeholder: '1000000'
    },
    transferRate: {
        show: true,
        required: false,
        label: 'Transfer Fee (0-1%):',
        placeholder: '0'
    },
    tickSize: {
        show: true,
        required: false,
        label: 'Tick Size (0-15):',
        placeholder: '5'
    },
    domain: {
        show: true,
        required: false,
        label: 'Domain:',
        placeholder: 'example.com'
    },
    requireDestTag: {
        show: true,
        required: false,
        label: 'Require Destination Tags:'
    },
    disallowXRP: {
        show: true,
        required: false,
        label: 'Disallow XRP:'
    }
};

const FormField: React.FC<{
    id: string;
    type: string;
    value: string | number | boolean;
    onChange: (value: any) => void;
    config: FieldConfig;
    min?: string;
    max?: string;
    error?: string;
}> = ({ id, type, value, onChange, config, min, max, error }) => {
    if (!config.show) return null;

    if (type === 'checkbox') {
        return (
            <div className="checkbox-field">
                <input
                    id={id}
                    type="checkbox"
                    checked={value as boolean}
                    onChange={e => onChange(e.target.checked)}
                />
                <label htmlFor={id}>
                    {config.label}
                    {config.required && <span className="required">*</span>}
                </label>
            </div>
        );
    }

    return (
        <div className={`form-field ${error ? 'error' : ''}`}>
            <label htmlFor={id}>
                {config.label}
                {config.required && <span className="required">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={typeof value === 'boolean' ? undefined : String(value)}
                onChange={e => onChange(e.target.value)}
                placeholder={config.placeholder}
                required={config.required}
                min={min}
                max={max}
            />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export const IssueTokenForm: React.FC = () => {
    const {
        connectionStatus,
        transactionStatus,
        values,
        updateValue,
        issueToken
    } = useBlockchain();

    const isConnected = connectionStatus === 'Connected';

    const handleChange = (field: keyof BlockchainValues) => (value: any) => {
        updateValue(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            await issueToken();
        }
    };

    const isFormValid = useMemo(() => {
        return Boolean(
            values.currencyCode &&
            values.amount &&
            Number(values.amount) > 0 &&
            Number(values.transferRate) >= 0 &&
            Number(values.transferRate) <= 1 &&
            Number(values.tickSize) >= 0 &&
            Number(values.tickSize) <= 15
        );
    }, [values]);

    return (
        <div className="token-form-container">
            <div className="token-form-inner">
                <h2 className="token-form-title">Issue Token</h2>

                <div className="token-form-info">
                    <p>This will configure your account as a token issuer and create your first tokens.</p>
                </div>

                <form onSubmit={handleSubmit} className="token-form">
                    <FormField
                        id="currencyCode"
                        type="text"
                        value={values.currencyCode}
                        onChange={handleChange('currencyCode')}
                        config={defaultConfig.currencyCode}
                    />

                    <FormField
                        id="amount"
                        type="number"
                        value={values.amount}
                        onChange={handleChange('amount')}
                        config={defaultConfig.amount}
                        min="0"
                    />

                    <FormField
                        id="transferRate"
                        type="number"
                        value={values.transferRate}
                        onChange={handleChange('transferRate')}
                        config={defaultConfig.transferRate}
                        min="0"
                        max="1"
                    />

                    <FormField
                        id="tickSize"
                        type="number"
                        value={values.tickSize}
                        onChange={handleChange('tickSize')}
                        config={defaultConfig.tickSize}
                        min="0"
                        max="15"
                    />

                    <FormField
                        id="domain"
                        type="text"
                        value={values.domain}
                        onChange={handleChange('domain')}
                        config={defaultConfig.domain}
                    />

                    <FormField
                        id="requireDestTag"
                        type="checkbox"
                        value={values.requireDestTag}
                        onChange={handleChange('requireDestTag')}
                        config={defaultConfig.requireDestTag}
                    />

                    <FormField
                        id="disallowXRP"
                        type="checkbox"
                        value={values.disallowXRP}
                        onChange={handleChange('disallowXRP')}
                        config={defaultConfig.disallowXRP}
                    />

                    <button
                        type="submit"
                        className={`submit-button ${transactionStatus === 'Processing' ? 'processing' : ''}`}
                        disabled={!isConnected || !isFormValid || transactionStatus === 'Processing'}
                    >
                        {!isConnected
                            ? 'Connect Wallet to Issue Token'
                            : !isFormValid
                                ? 'Complete Form to Issue Token'
                                : transactionStatus === 'Processing'
                                    ? 'Processing...'
                                    : 'Issue Token'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IssueTokenForm;