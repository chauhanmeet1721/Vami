import { IDeviceInfo } from '../../modules/auth/models/session.model';

export class DeviceParserUtil {
  static parse(userAgentString = ''): IDeviceInfo {
    const ua = userAgentString.toLowerCase();

    // Determine OS
    let os = 'Unknown OS';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('linux')) os = 'Linux';

    // Determine Browser
    let browser = 'Unknown Browser';
    if (ua.includes('edg/')) browser = 'Edge';
    else if (ua.includes('chrome') && !ua.includes('edg/')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

    // Determine Device Type
    let deviceType: IDeviceInfo['deviceType'] = 'desktop';
    if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    } else if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      deviceType = 'mobile';
    }

    return {
      browser,
      os,
      deviceType,
    };
  }
}
