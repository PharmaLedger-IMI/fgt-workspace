# Script for generation configuration

The script used to generate configuration files is executed via a GitHub Action on every push to the master branch. Script processes all content of [network](../networks) directory, where it assumes that first level of directory is an environment and them reads everything from *editable* subdirectorery and regenrate config files into environment root directory.

## Output files

Following files are generated:
| Filename:     | Description:      |
| :---          | :---              |
| bdns-&lt;company-name&gt;.json | A company specific BDNS configuration for epi use-case. Can be directly used for epi Helm chart. |
| bdns.json     | List of BDNS domains |
| company.json  | List of companies     |
| enode.json    | List of enodes        |
| validator.json    | List of validators    |
| ip-whitelist  | List of egress node IP adresses - should be directly applicable into FW. |
| genesis-geth.json,</br> smartContractAbi.json,</br> smartContractAddress.json | Files copied from PLA directory as source files. |
| plugin_data_common.json | Ordered configuration values to be used directly in epi Helm chart. |

## Hardcoded value mapping

Generally, any input is processed, but some values are hardcoded:

- blockchain-node-outbound-ips mapped into ip-whitelis and as egress into plugin_data_common.json  
- if more values are included - an array is created, for BDNS always just first value is included

## Helper files

[Helper files](./scripts/helper-files/) contain current format of the BDNS yaml file.
