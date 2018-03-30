import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isAnyOfflineWithWeb3 } from 'selectors/derived';
import {
  AddressField,
  AmountField,
  TXMetaDataPanel,
  CurrentCustomMessage,
  GenerateTransaction,
  SendButton,
  SchedulingToggle,
  ScheduleFields
} from 'components';
import { OnlyUnlocked, WhenQueryExists } from 'components/renderCbs';
import translate from 'translations';

import { AppState } from 'reducers';
import { NonStandardTransaction } from './components';
import { getOffline, getNetworkConfig } from 'selectors/config';
import { SendScheduleTransactionButton } from 'containers/Tabs/ScheduleTransaction/components/SendScheduleTransactionButton';
import { GenerateScheduleTransactionButton } from 'containers/Tabs/ScheduleTransaction/components/GenerateScheduleTransactionButton';
import { getCurrentSchedulingToggle, ICurrentSchedulingToggle } from 'selectors/transaction';

const QueryWarning: React.SFC<{}> = () => (
  <WhenQueryExists
    whenQueryExists={
      <div className="alert alert-info">
        <p>{translate('WARN_SEND_LINK')}</p>
      </div>
    }
  />
);

interface StateProps {
  schedulingAvailable: boolean;
  shouldDisplay: boolean;
  offline: boolean;
  useScheduling: ICurrentSchedulingToggle['value'];
}

class FieldsClass extends Component<StateProps> {
  public render() {
    const { shouldDisplay, schedulingAvailable, useScheduling } = this.props;

    return (
      <OnlyUnlocked
        whenUnlocked={
          <React.Fragment>
            <QueryWarning />
            {shouldDisplay && (
              <div className="Tab-content-pane">
                <AddressField />
                <div className="row form-group">
                  <div className={schedulingAvailable ? 'col-xs-10' : 'col-xs-12'}>
                    <AmountField hasUnitDropdown={true} hasSendEverything={true} />
                  </div>
                  {schedulingAvailable && (
                    <div className="col-xs-2">
                      <SchedulingToggle />
                    </div>
                  )}
                </div>

                {useScheduling && <ScheduleFields />}

                <div className="row form-group">
                  <div className="col-xs-12">
                    <TXMetaDataPanel scheduling={useScheduling} />
                  </div>
                </div>

                <CurrentCustomMessage />
                <NonStandardTransaction />

                {this.getTxButton()}
              </div>
            )}
          </React.Fragment>
        }
      />
    );
  }

  private getTxButton() {
    const { offline, useScheduling } = this.props;

    if (useScheduling) {
      if (offline) {
        return <GenerateScheduleTransactionButton />;
      }

      return <SendScheduleTransactionButton signing={true} />;
    }

    if (offline) {
      return <GenerateTransaction />;
    }

    return <SendButton signing={true} />;
  }
}

export const Fields = connect((state: AppState) => ({
  schedulingAvailable: getNetworkConfig(state).name === 'Kovan',
  shouldDisplay: !isAnyOfflineWithWeb3(state),
  offline: getOffline(state),
  useScheduling: getCurrentSchedulingToggle(state).value
}))(FieldsClass);
