package com.openblocks.api.config;


import java.util.List;

import com.openblocks.sdk.auth.AbstractAuthConfig;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ConfigView {

    private boolean isCloudHosting;
    private List<AbstractAuthConfig> authConfigs;
    private boolean needUpdate;
}
