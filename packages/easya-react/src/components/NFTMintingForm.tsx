import React, { useState, useMemo, useEffect } from 'react';
import { useBlockchain } from '../hooks/BlockchainContext';

interface FieldConfig {
  show: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

interface NFTFormConfig {
  showMetadataGenerator: boolean;
  nftURI: FieldConfig;
  nftTaxon: FieldConfig;
  nftTransferFee: FieldConfig;
  nftFlags: FieldConfig;
  imageUrl: FieldConfig;
  name: FieldConfig;
  description: FieldConfig;
}

interface NFTMintingFormProps {
  config?: Partial<NFTFormConfig>;
}

const defaultConfig: NFTFormConfig = {
  showMetadataGenerator: true,
  nftURI: {
    show: false,
    required: true,
    label: 'NFT URI:',
    placeholder: 'ipfs://... or generate from metadata'
  },
  nftTaxon: {
    show: true,
    required: true,
    label: 'Collection:'
  },
  nftTransferFee: {
    show: false,
    required: false,
    label: 'Transfer Fee (0-50000):'
  },
  nftFlags: {
    show: false,
    required: false,
    label: 'Flags:'
  },
  imageUrl: {
    show: true,
    required: true,
    label: 'Image URL:',
    placeholder: 'https://...'
  },
  name: {
    show: true,
    required: true,
    label: 'NFT Name:',
    placeholder: 'My NFT'
  },
  description: {
    show: true,
    required: true,
    label: 'Description:',
    placeholder: 'Describe your NFT'
  }
};

const FormField: React.FC<{
  id: string;
  type: string;
  value: string | number;
  onChange: (value: string) => void;
  config: FieldConfig;
  min?: string;
  max?: string;
}> = ({ id, type, value, onChange, config, min, max }) => {
  if (!config.show) return null;

  return (
    <div className="form-field-container">
      <label htmlFor={id} className="form-field-label">
        {config.label}
        {config.required && <span className="form-field-required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="form-field-input"
        placeholder={config.placeholder}
        required={config.required}
        min={min}
        max={max}
      />
    </div>
  );
};

export const NFTMintingForm: React.FC<NFTMintingFormProps> = ({ config = {} }) => {
  const {
    values,
    updateValue,
    mintNFT,
    connectionStatus,
    transactionStatus,
  } = useBlockchain();

  const [metadataFields, setMetadataFields] = useState({
    imageUrl: '',
    name: '',
    description: ''
  });

  const finalConfig: NFTFormConfig = {
    ...defaultConfig,
    ...Object.fromEntries(
      Object.entries(config).map(([key, value]) => [
        key,
        typeof value === 'object' 
          ? { ...(defaultConfig[key as keyof NFTFormConfig] as object), ...(value as object) }
          : value
      ])
    )
  } as NFTFormConfig;

  const handleMetadataChange = (field: keyof typeof metadataFields) => (value: string) => {
    setMetadataFields(prev => ({ ...prev, [field]: value }));
  };

  function createMetaData(imageUrl: string, name: string, description: string) {
    return {
      name,
      description,
      image: imageUrl,
    };
  }

  // Automatically update NFT URI when metadata fields change
  useEffect(() => {
    const { imageUrl, name, description } = metadataFields;
    if (imageUrl && name) {
      const metadata = createMetaData(imageUrl, name, description);
      updateValue('nftURI', metadata);
    }
  }, [metadataFields, updateValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mintNFT();
  };

  const isConnected = connectionStatus === 'Connected';
  
  const isMetadataComplete = useMemo(() => {
    return Boolean(
      metadataFields.imageUrl &&
      metadataFields.name &&
      metadataFields.description &&
      values.nftTaxon
    );
  }, [metadataFields, values.nftTaxon]);

  const isMintEnabled = isConnected && isMetadataComplete;

  return (
    <form onSubmit={handleSubmit} className="nft-minting-form">
      <h2>Mint NFT</h2>

      <div className="nft-minting-form-section">
        {finalConfig.showMetadataGenerator && (
          <div className="metadata-generator">
            <h3>Metadata Generator</h3>
            <div>
              <FormField
                id="imageUrl"
                type="text"
                value={metadataFields.imageUrl}
                onChange={handleMetadataChange('imageUrl')}
                config={finalConfig.imageUrl}
              />
              <FormField
                id="name"
                type="text"
                value={metadataFields.name}
                onChange={handleMetadataChange('name')}
                config={finalConfig.name}
              />
              <FormField
                id="description"
                type="text"
                value={metadataFields.description}
                onChange={handleMetadataChange('description')}
                config={finalConfig.description}
              />
            </div>
          </div>
        )}

        <FormField
          id="nftURI"
          type="text"
          value={values.nftURI}
          onChange={value => updateValue('nftURI', value)}
          config={finalConfig.nftURI}
        />

        <FormField
          id="nftTaxon"
          type="number"
          value={values.nftTaxon}
          onChange={value => updateValue('nftTaxon', value)}
          config={finalConfig.nftTaxon}
          min="0"
        />

        <FormField
          id="nftTransferFee"
          type="number"
          value={values.nftTransferFee}
          onChange={value => updateValue('nftTransferFee', value)}
          config={finalConfig.nftTransferFee}
          min="0"
          max="50000"
        />

        <FormField
          id="nftFlags"
          type="number"
          value={values.nftFlags}
          onChange={value => updateValue('nftFlags', value)}
          config={finalConfig.nftFlags}
          min="0"
        />

        <button
          type="submit"
          className="mint-button"
          disabled={!isMintEnabled || transactionStatus === 'Processing'}
        >
          {!isConnected 
            ? 'Connect Wallet to Mint'
            : !isMetadataComplete 
              ? 'Complete Metadata to Mint'
              : 'Mint NFT'}
        </button>
      </div>
    </form>
  );
};

export default NFTMintingForm;